"""The station as a weather entity."""

from unittest.mock import patch

from homeassistant.core import HomeAssistant, ServiceRegistry
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weather_station.const import DOMAIN

RAIN = "binary_sensor.capteur_pluie_contact"
SOURCE = "weather.meteo_france"


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


def _weather(hass: HomeAssistant, entry: MockConfigEntry) -> str:
    return er.async_get(hass).async_get_entity_id("weather", DOMAIN, f"{entry.entry_id}_weather")


async def test_readings_in_home_assistant_units(hass: HomeAssistant) -> None:
    hass.states.async_set("sensor.temp", "50", {"unit_of_measurement": "°F"})
    hass.states.async_set("sensor.hum", "60", {"unit_of_measurement": "%"})
    hass.states.async_set("sensor.pres", "101.3", {"unit_of_measurement": "kPa"})
    hass.states.async_set("sensor.wind", "5", {"unit_of_measurement": "m/s"})
    hass.states.async_set("sensor.gust", "10", {"unit_of_measurement": "m/s"})
    hass.states.async_set("sensor.dir", "SO")
    hass.states.async_set("sensor.uv", "3.2")
    entry = await _setup(
        hass,
        temperature_entity="sensor.temp",
        humidity_entity="sensor.hum",
        pressure_entity="sensor.pres",
        wind_speed_entity="sensor.wind",
        wind_gust_entity="sensor.gust",
        wind_direction_entity="sensor.dir",
        uv_index_entity="sensor.uv",
    )
    weather = _weather(hass, entry)
    assert weather == "weather.jardin"
    attributes = hass.states.get(weather).attributes
    assert attributes["temperature"] == 10.0
    assert attributes["humidity"] == 60
    assert attributes["pressure"] == 1013.0
    assert attributes["wind_speed"] == 18.0
    assert attributes["wind_gust_speed"] == 36.0
    assert attributes["wind_bearing"] == 225
    assert attributes["uv_index"] == 3.2
    assert attributes["dew_point"] == 2.6
    assert attributes["rain_today"] == 0.0
    # Nothing tells the sky condition: no sun sensor, no forecast entity.
    assert hass.states.get(weather).state == "unknown"

    hass.states.async_set("sensor.temp", "59", {"unit_of_measurement": "°F"})
    await hass.async_block_till_done()
    assert hass.states.get(weather).attributes["temperature"] == 15.0


async def test_condition_from_rain_and_sun(hass: HomeAssistant) -> None:
    hass.states.async_set("sun.sun", "above_horizon", {"elevation": 40})
    hass.states.async_set("sensor.solar", "650", {"unit_of_measurement": "W/m²"})
    entry = await _setup(hass, solar_radiation_entity="sensor.solar")
    weather = _weather(hass, entry)
    assert hass.states.get(weather).state == "sunny"

    hass.states.async_set("sensor.solar", "120", {"unit_of_measurement": "W/m²"})
    await hass.async_block_till_done()
    assert hass.states.get(weather).state == "cloudy"

    # The gauge tips: rain wins over the sky.
    hass.states.async_set(RAIN, "off")
    await hass.async_block_till_done()
    assert hass.states.get(weather).state == "rainy"


async def test_condition_and_forecasts_from_another_weather_entity(hass: HomeAssistant) -> None:
    hass.states.async_set(SOURCE, "rainy", {
        "supported_features": 1 | 2,  # daily and hourly
        "temperature_unit": "°F",
        "wind_speed_unit": "mph",
        "precipitation_unit": "in",
        "pressure_unit": "inHg",
    })
    entry = await _setup(hass, forecast_entity=SOURCE)
    weather = _weather(hass, entry)
    # Forecast rain, but the gauge does not see any.
    assert hass.states.get(weather).state == "cloudy"
    assert hass.states.get(weather).attributes["supported_features"] == 1 | 2

    hass.states.async_set(SOURCE, "sunny", hass.states.get(SOURCE).attributes)
    await hass.async_block_till_done()
    assert hass.states.get(weather).state == "sunny"

    original = ServiceRegistry.async_call

    async def fake_call(self, domain, service, service_data=None, *args, **kwargs):
        if domain == "weather" and (service_data or {}).get("entity_id") == SOURCE:
            return {SOURCE: {"forecast": [{
                "datetime": "2026-10-14T00:00:00+00:00",
                "condition": "rainy",
                "temperature": 59,
                "templow": 41,
                "wind_speed": 10,
                "precipitation": 0.2,
                "pressure": 29.92,
            }]}}
        return await original(self, domain, service, service_data, *args, **kwargs)

    with patch.object(ServiceRegistry, "async_call", fake_call):
        response = await hass.services.async_call(
            "weather", "get_forecasts", {"entity_id": weather, "type": "daily"},
            blocking=True, return_response=True,
        )
    forecast = response[weather]["forecast"][0]
    assert forecast["condition"] == "rainy"
    assert forecast["temperature"] == 15.0
    assert forecast["templow"] == 5.0
    assert forecast["wind_speed"] == 16.09
    assert forecast["precipitation"] == 5.08
    assert forecast["pressure"] == 1013.21


async def test_never_borrows_from_itself(hass: HomeAssistant) -> None:
    entry = await _setup(hass)
    weather = _weather(hass, entry)
    hass.config_entries.async_update_entry(entry, data={**entry.data, "forecast_entity": weather})
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    state = hass.states.get(weather)
    assert state.state == "unknown"
    assert state.attributes["supported_features"] == 0
    assert state.attributes["forecast_entity"] is None
