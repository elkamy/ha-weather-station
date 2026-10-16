"""The station's own copy of each reading, kept as a measurement."""

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weather_station.const import DOMAIN

RAIN = "binary_sensor.capteur_pluie_contact"


async def _setup(hass: HomeAssistant, **data) -> MockConfigEntry:
    hass.states.async_set(RAIN, "on")
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Jardin",
        unique_id=RAIN,
        data={"station_name": "Jardin", "rain_entity": RAIN, "import_history": False, **data},
        options={"mm_per_tip": 0.5},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _measure(hass: HomeAssistant, entry: MockConfigEntry, attribute: str) -> str | None:
    return er.async_get(hass).async_get_entity_id("sensor", DOMAIN, f"{entry.entry_id}_{attribute}")


async def test_measures_in_fixed_units_with_statistics(hass: HomeAssistant) -> None:
    # An anemometer without state_class, shown in m/s, and a thermometer in °F.
    hass.states.async_set("sensor.wind", "5", {"unit_of_measurement": "m/s"})
    hass.states.async_set("sensor.temp", "50", {"unit_of_measurement": "°F"})
    hass.states.async_set("sensor.hum", "60", {"unit_of_measurement": "%"})
    hass.states.async_set("sensor.dir", "SO")
    entry = await _setup(
        hass,
        wind_speed_entity="sensor.wind",
        temperature_entity="sensor.temp",
        humidity_entity="sensor.hum",
        wind_direction_entity="sensor.dir",
    )

    wind = hass.states.get(_measure(hass, entry, "wind_speed"))
    assert wind.attributes["state_class"] == "measurement"
    assert wind.attributes["device_class"] == "wind_speed"
    # Stored in km/h, shown in the source's unit.
    assert wind.attributes["unit_of_measurement"] == "m/s"
    assert float(wind.state) == 5.0
    registry_entry = er.async_get(hass).async_get(wind.entity_id)
    assert registry_entry.options["sensor.private"]["suggested_unit_of_measurement"] == "m/s"

    temperature = hass.states.get(_measure(hass, entry, "temperature"))
    assert temperature.attributes["unit_of_measurement"] == "°F"
    assert float(temperature.state) == 50.0
    assert float(hass.states.get(_measure(hass, entry, "humidity")).state) == 60
    assert float(hass.states.get(_measure(hass, entry, "wind_direction")).state) == 225

    station = er.async_get(hass).async_get_entity_id("sensor", DOMAIN, f"{entry.entry_id}_rain_today")
    assert hass.states.get(station).attributes["measures"] == {
        "temperature": temperature.entity_id,
        "humidity": _measure(hass, entry, "humidity"),
        "wind_speed": wind.entity_id,
        "wind_direction": _measure(hass, entry, "wind_direction"),
    }

    hass.states.async_set("sensor.wind", "10", {"unit_of_measurement": "m/s"})
    await hass.async_block_till_done()
    assert float(hass.states.get(wind.entity_id).state) == 10.0

    # A unit that cannot be converted gives no value rather than a wrong one.
    hass.states.async_set("sensor.wind", "3", {"unit_of_measurement": "nœuds?"})
    await hass.async_block_till_done()
    assert hass.states.get(wind.entity_id).state == "unknown"


async def test_unit_adopted_when_the_source_wakes_up(hass: HomeAssistant) -> None:
    # A sleeping anemometer: no unit known when the station sensor is registered.
    hass.states.async_set("sensor.wind", "unavailable")
    entry = await _setup(hass, wind_speed_entity="sensor.wind")
    wind = _measure(hass, entry, "wind_speed")
    assert hass.states.get(wind).attributes["unit_of_measurement"] == "km/h"

    hass.states.async_set("sensor.wind", "2", {"unit_of_measurement": "m/s"})
    await hass.async_block_till_done()
    state = hass.states.get(wind)
    assert state.attributes["unit_of_measurement"] == "m/s"
    assert float(state.state) == 2.0

    # A unit chosen in the entity settings is never replaced.
    er.async_get(hass).async_update_entity_options(wind, "sensor", {"unit_of_measurement": "km/h"})
    await hass.async_block_till_done()
    hass.states.async_set("sensor.wind", "3", {"unit_of_measurement": "m/s"})
    await hass.async_block_till_done()
    assert hass.states.get(wind).attributes["unit_of_measurement"] == "km/h"


async def test_measure_removed_with_its_sensor(hass: HomeAssistant) -> None:
    hass.states.async_set("sensor.wind", "5", {"unit_of_measurement": "km/h"})
    entry = await _setup(hass, wind_speed_entity="sensor.wind")
    assert _measure(hass, entry, "wind_speed") is not None

    data = {key: value for key, value in entry.data.items() if key != "wind_speed_entity"}
    hass.config_entries.async_update_entry(entry, data=data)
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert _measure(hass, entry, "wind_speed") is None
