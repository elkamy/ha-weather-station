"""Readings published for the dashboard, computed sensors and the sidebar panel."""

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weather_station.const import DOMAIN, PANEL_URL_PATH

RAIN = "binary_sensor.capteur_pluie_contact"


async def _setup(hass: HomeAssistant, rain=RAIN, **data) -> MockConfigEntry:
    hass.states.async_set(rain, "on")
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Jardin",
        unique_id=rain,
        data={"station_name": "Jardin", "rain_entity": rain, "import_history": False, **data},
        options={"mm_per_tip": 0.5},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _entity(hass: HomeAssistant, entry: MockConfigEntry, key: str) -> str | None:
    return er.async_get(hass).async_get_entity_id("sensor", DOMAIN, f"{entry.entry_id}_{key}")


def _binary(hass: HomeAssistant, entry: MockConfigEntry, key: str) -> str | None:
    return er.async_get(hass).async_get_entity_id("binary_sensor", DOMAIN, f"{entry.entry_id}_{key}")


async def test_station_publishes_every_reading(hass: HomeAssistant) -> None:
    hass.states.async_set("sensor.temp", "20", {"unit_of_measurement": "°C"})
    hass.states.async_set("sensor.hum", "50", {"unit_of_measurement": "%"})
    hass.states.async_set("sensor.wind", "36", {"unit_of_measurement": "km/h"})
    hass.states.async_set("sensor.dir", "NO")
    entry = await _setup(
        hass,
        temperature_entity="sensor.temp",
        humidity_entity="sensor.hum",
        wind_speed_entity="sensor.wind",
        wind_direction_entity="sensor.dir",
    )
    attributes = hass.states.get(_entity(hass, entry, "rain_today")).attributes
    assert attributes["wind_direction"] == 315
    assert attributes["dew_point"] == 9.3
    assert attributes["entities"] == {
        "temperature": "sensor.temp",
        "humidity": "sensor.hum",
        "wind_speed": "sensor.wind",
        "wind_direction": "sensor.dir",
        "rain_total": _entity(hass, entry, "rain_total"),
        "dew_point": _entity(hass, entry, "dew_point"),
        "feels_like": _entity(hass, entry, "feels_like"),
        "raining": _binary(hass, entry, "raining"),
        "frost": _binary(hass, entry, "frost"),
        "strong_wind": _binary(hass, entry, "strong_wind"),
        "weather": er.async_get(hass).async_get_entity_id("weather", DOMAIN, f"{entry.entry_id}_weather"),
    }

    dew_point = hass.states.get(_entity(hass, entry, "dew_point"))
    assert float(dew_point.state) == 9.3
    assert dew_point.attributes["device_class"] == "temperature"
    # 10 m/s of wind: 20 + 0.33 × 11.66 − 0.70 × 10 − 4 = 12.8
    assert float(hass.states.get(_entity(hass, entry, "feels_like")).state) == 12.8

    hass.states.async_set("sensor.hum", "100", {"unit_of_measurement": "%"})
    await hass.async_block_till_done()
    assert float(hass.states.get(_entity(hass, entry, "dew_point")).state) == 20.0


async def test_no_comfort_sensors_without_humidity(hass: HomeAssistant) -> None:
    hass.states.async_set("sensor.temp", "20", {"unit_of_measurement": "°C"})
    entry = await _setup(hass, temperature_entity="sensor.temp")
    assert _entity(hass, entry, "dew_point") is None
    assert "dew_point" not in hass.states.get(_entity(hass, entry, "rain_today")).attributes


async def test_panel_follows_the_stations(hass: HomeAssistant, register_panel) -> None:
    first = await _setup(hass)
    second = await _setup(hass, rain="binary_sensor.toit")
    # One panel for every station.
    register_panel.assert_awaited_once()
    assert register_panel.call_args.kwargs["frontend_url_path"] == PANEL_URL_PATH
    assert register_panel.call_args.kwargs["webcomponent_name"] == "weather-station-panel"

    assert await hass.config_entries.async_unload(first.entry_id)
    register_panel.remove.assert_not_called()
    assert await hass.config_entries.async_unload(second.entry_id)
    register_panel.remove.assert_called_once()
