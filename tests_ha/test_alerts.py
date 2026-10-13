"""Frost, strong wind and rain alerts: binary sensors and events."""

from homeassistant.core import HomeAssistant, State
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
    mock_restore_cache,
)

from custom_components.weather_station.const import DOMAIN, EVENT_ALERT

RAIN = "binary_sensor.capteur_pluie_contact"
TEMP = "sensor.temp"
GUST = "sensor.gust"


async def _setup(hass: HomeAssistant, options=None, **data) -> MockConfigEntry:
    hass.states.async_set(RAIN, "on")
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Jardin",
        unique_id=RAIN,
        data={"station_name": "Jardin", "rain_entity": RAIN, "import_history": False, **data},
        options={"mm_per_tip": 0.5, **(options or {})},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _binary(hass: HomeAssistant, entry: MockConfigEntry, key: str) -> str | None:
    return er.async_get(hass).async_get_entity_id("binary_sensor", DOMAIN, f"{entry.entry_id}_{key}")


async def _set(hass: HomeAssistant, entity_id: str, value: str, unit: str) -> None:
    hass.states.async_set(entity_id, value, {"unit_of_measurement": unit})
    await hass.async_block_till_done()


async def test_frost_alert_episode(hass: HomeAssistant) -> None:
    hass.states.async_set(TEMP, "5", {"unit_of_measurement": "°C"})
    entry = await _setup(hass, temperature_entity=TEMP)
    events = async_capture_events(hass, EVENT_ALERT)
    frost = _binary(hass, entry, "frost")
    assert hass.states.get(frost).state == "off"
    # No strong wind sensor without a wind sensor.
    assert _binary(hass, entry, "strong_wind") is None

    await _set(hass, TEMP, "1.5", "°C")
    assert hass.states.get(frost).state == "on"
    assert len(events) == 1
    assert events[0].data == {
        "config_entry_id": entry.entry_id,
        "station_name": "Jardin",
        "alert": "frost",
        "active": True,
        "value": 1.5,
        "threshold": 2.0,
        "unit": "°C",
        "entity_id": frost,
    }

    # Hovering around the threshold does not start a new episode.
    await _set(hass, TEMP, "2.6", "°C")
    await _set(hass, TEMP, "1.9", "°C")
    assert hass.states.get(frost).state == "on"
    assert len(events) == 1

    # Unavailable sensor: the alert stays as it is.
    hass.states.async_set(TEMP, "unavailable")
    await hass.async_block_till_done()
    assert hass.states.get(frost).state == "on"

    await _set(hass, TEMP, "3.5", "°C")
    assert hass.states.get(frost).state == "off"
    assert len(events) == 2
    assert events[1].data["active"] is False


async def test_frost_threshold_in_fahrenheit_sensor(hass: HomeAssistant) -> None:
    hass.states.async_set(TEMP, "41", {"unit_of_measurement": "°F"})  # 5 °C
    entry = await _setup(hass, temperature_entity=TEMP)
    frost = _binary(hass, entry, "frost")
    assert hass.states.get(frost).state == "off"
    await _set(hass, TEMP, "33.8", "°F")  # 1 °C
    assert hass.states.get(frost).state == "on"


async def test_strong_wind_uses_gusts_in_any_unit(hass: HomeAssistant) -> None:
    hass.states.async_set("sensor.wind", "3", {"unit_of_measurement": "m/s"})
    hass.states.async_set(GUST, "5", {"unit_of_measurement": "m/s"})
    entry = await _setup(
        hass, options={"wind_threshold": 50}, wind_speed_entity="sensor.wind", wind_gust_entity=GUST
    )
    events = async_capture_events(hass, EVENT_ALERT)
    wind = _binary(hass, entry, "strong_wind")
    assert hass.states.get(wind).state == "off"

    await _set(hass, GUST, "14.5", "m/s")  # 52.2 km/h
    assert hass.states.get(wind).state == "on"
    assert events[-1].data["alert"] == "strong_wind"
    assert events[-1].data["value"] == 52.2
    assert events[-1].data["unit"] == "km/h"
    assert hass.states.get(wind).attributes["threshold"] == 50.0

    # The mean wind is ignored when there are gusts.
    await _set(hass, "sensor.wind", "1", "m/s")
    assert hass.states.get(wind).state == "on"
    await _set(hass, GUST, "10", "m/s")  # 36 km/h < 40
    assert hass.states.get(wind).state == "off"


async def test_rain_episode_fires_events(hass: HomeAssistant) -> None:
    entry = await _setup(hass)
    events = async_capture_events(hass, EVENT_ALERT)
    raining = _binary(hass, entry, "raining")
    assert hass.states.get(raining).state == "off"

    hass.states.async_set(RAIN, "off")
    await hass.async_block_till_done()
    assert hass.states.get(raining).state == "on"
    assert [(event.data["alert"], event.data["active"], event.data["value"]) for event in events] == [
        ("rain", True, 0.5)
    ]

    # A second tip during the same shower is not a new episode.
    hass.states.async_set(RAIN, "on")
    await hass.async_block_till_done()
    assert len(events) == 1


async def test_restart_does_not_announce_an_episode_again(hass: HomeAssistant) -> None:
    entry_id = "frost_restart"
    mock_restore_cache(hass, [State("binary_sensor.jardin_risque_de_gel", "on")])
    hass.states.async_set(TEMP, "0", {"unit_of_measurement": "°C"})
    events = async_capture_events(hass, EVENT_ALERT)
    hass.states.async_set(RAIN, "on")
    entry = MockConfigEntry(
        domain=DOMAIN,
        entry_id=entry_id,
        title="Jardin",
        unique_id=RAIN,
        data={"station_name": "Jardin", "rain_entity": RAIN, "import_history": False, "temperature_entity": TEMP},
        options={"mm_per_tip": 0.5},
    )
    entry.add_to_hass(hass)
    # Same entity ID as before the restart.
    er.async_get(hass).async_get_or_create(
        "binary_sensor", DOMAIN, f"{entry_id}_frost", suggested_object_id="jardin_risque_de_gel"
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert hass.states.get("binary_sensor.jardin_risque_de_gel").state == "on"
    assert [event for event in events if event.data["alert"] == "frost"] == []


async def test_alert_thresholds_in_the_options(hass: HomeAssistant) -> None:
    hass.states.async_set(TEMP, "1", {"unit_of_measurement": "°C"})
    entry = await _setup(hass, temperature_entity=TEMP)
    assert hass.states.get(_binary(hass, entry, "frost")).state == "on"

    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["menu_options"] == ["settings", "alerts", "reset"]
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "alerts"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"frost_threshold": 0, "wind_threshold": 70}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    assert entry.options["frost_threshold"] == 0
    assert entry.options["mm_per_tip"] == 0.5
    # Reloaded with the new threshold; the restored "on" ends at 0 + 1 °C.
    assert hass.states.get(_binary(hass, entry, "frost")).state == "on"
    await _set(hass, TEMP, "1.5", "°C")
    assert hass.states.get(_binary(hass, entry, "frost")).state == "off"
