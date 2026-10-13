"""Setup, flows and entities in a real Home Assistant."""

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import device_registry as dr, entity_registry as er
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
        options={"mm_per_tip": 0.5, "debounce_seconds": 0, "rain_window_minutes": 30},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _entity(hass: HomeAssistant, entry: MockConfigEntry, key: str) -> str:
    registry = er.async_get(hass)
    return next(
        item.entity_id
        for item in er.async_entries_for_config_entry(registry, entry.entry_id)
        if item.unique_id == f"{entry.entry_id}_{key}"
    )


async def test_tips_update_the_entities(hass: HomeAssistant) -> None:
    entry = await _setup(hass)
    today = _entity(hass, entry, "rain_today")
    assert float(hass.states.get(today).state) == 0.0

    for state in ("off", "on", "off", "unavailable", "on", "off"):
        hass.states.async_set(RAIN, state)
        await hass.async_block_till_done()

    # 4 tips; the change back from "unavailable" is not one.
    assert float(hass.states.get(today).state) == 2.0
    attributes = hass.states.get(today).attributes
    assert attributes["weather_station"] is True
    assert attributes["station_name"] == "Jardin"
    assert attributes["raining"] is True
    assert sum(attributes["hourly_rain"]) == 2.0
    assert float(hass.states.get(_entity(hass, entry, "rain_total")).state) == 2.0
    assert float(hass.states.get(_entity(hass, entry, "rain_last_hour")).state) == 2.0
    assert hass.states.get(_entity(hass, entry, "raining")).state == "on"
    assert hass.states.get(_entity(hass, entry, "last_rain")).state not in ("unknown", "unavailable")

    device = dr.async_get(hass).async_get_device_by_identifier(
        (DOMAIN, entry.entry_id), entry.entry_id
    )
    assert device.name == "Jardin"


async def test_tips_survive_a_reload(hass: HomeAssistant) -> None:
    entry = await _setup(hass)
    hass.states.async_set(RAIN, "off")
    await hass.async_block_till_done()
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert float(hass.states.get(_entity(hass, entry, "rain_total")).state) == 0.5


async def test_calibration_change_applies_to_totals(hass: HomeAssistant) -> None:
    entry = await _setup(hass)
    hass.states.async_set(RAIN, "off")
    await hass.async_block_till_done()
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {"mm_per_tip": 0.3, "debounce_seconds": 0, "rain_window_minutes": 30},
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    assert float(hass.states.get(_entity(hass, entry, "rain_today")).state) == 0.3


async def test_station_mirrors_optional_sensors(hass: HomeAssistant) -> None:
    hass.states.async_set("sensor.temp", "12.5", {"unit_of_measurement": "°C"})
    entry = await _setup(hass, temperature_entity="sensor.temp")
    today = _entity(hass, entry, "rain_today")
    assert hass.states.get(today).attributes["temperature"] == 12.5
    hass.states.async_set("sensor.temp", "13", {"unit_of_measurement": "°C"})
    await hass.async_block_till_done()
    assert hass.states.get(today).attributes["temperature"] == 13.0
    assert hass.states.get(today).attributes["temperature_unit"] == "°C"
    assert "humidity" not in hass.states.get(today).attributes


async def test_config_flow_suggests_the_battery(hass: HomeAssistant) -> None:
    config_entry = MockConfigEntry(domain="mqtt")
    config_entry.add_to_hass(hass)
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=config_entry.entry_id, identifiers={("mqtt", "aqara")}, name="Capteur Pluie"
    )
    registry = er.async_get(hass)
    registry.async_get_or_create(
        "binary_sensor", "mqtt", "contact", device_id=device.id,
        suggested_object_id="capteur_pluie_contact",
    )
    registry.async_get_or_create(
        "sensor", "mqtt", "battery", device_id=device.id,
        suggested_object_id="capteur_pluie_battery", original_device_class="battery",
    )
    hass.states.async_set(RAIN, "on")

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["step_id"] == "user"
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {"station_name": " Jardin ", "rain_entity": RAIN, "mm_per_tip": 0.524, "import_history": False},
    )
    assert result["step_id"] == "sensors"
    schema_keys = {str(key): key for key in result["data_schema"].schema}
    assert schema_keys["battery_entity"].description["suggested_value"] == "sensor.capteur_pluie_battery"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"battery_entity": "sensor.capteur_pluie_battery"}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Jardin"
    assert result["data"]["battery_entity"] == "sensor.capteur_pluie_battery"
    assert result["options"]["mm_per_tip"] == 0.524
    await hass.async_block_till_done()

    # The same rain gauge cannot be added twice.
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {"station_name": "Bis", "rain_entity": RAIN, "mm_per_tip": 0.5, "import_history": False},
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_reconfigure_changes_sensors(hass: HomeAssistant) -> None:
    hass.states.async_set("sensor.temp", "12")
    entry = await _setup(hass, temperature_entity="sensor.temp")
    hass.states.async_set("binary_sensor.autre", "off")
    result = await entry.start_reconfigure_flow(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"rain_entity": "binary_sensor.autre"}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    assert entry.data["rain_entity"] == "binary_sensor.autre"
    assert "temperature_entity" not in entry.data
    assert entry.unique_id == "binary_sensor.autre"
