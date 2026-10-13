"""Resetting the rain measurements from the options and from the action."""

from unittest.mock import patch

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weather_station.const import DOMAIN

RAIN = "binary_sensor.capteur_pluie_contact"


async def _setup_with_rain(hass: HomeAssistant) -> MockConfigEntry:
    hass.states.async_set(RAIN, "on")
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Jardin",
        unique_id=RAIN,
        data={"station_name": "Jardin", "rain_entity": RAIN, "import_history": False},
        options={"mm_per_tip": 0.5},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    for state in ("off", "on", "off"):
        hass.states.async_set(RAIN, state)
        await hass.async_block_till_done()
    return entry


def _state(hass: HomeAssistant, entry: MockConfigEntry, key: str) -> str:
    entity_id = er.async_get(hass).async_get_entity_id("sensor", DOMAIN, f"{entry.entry_id}_{key}")
    return hass.states.get(entity_id).state


async def test_reset_from_the_options_needs_a_confirmation(hass: HomeAssistant) -> None:
    entry = await _setup_with_rain(hass)
    assert float(_state(hass, entry, "rain_total")) == 1.5

    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.MENU
    assert result["menu_options"] == ["settings", "reset"]
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "reset"}
    )
    assert result["step_id"] == "reset"

    result = await hass.config_entries.options.async_configure(result["flow_id"], {"confirm": False})
    assert result["errors"] == {"confirm": "confirm_required"}
    assert float(_state(hass, entry, "rain_total")) == 1.5

    result = await hass.config_entries.options.async_configure(result["flow_id"], {"confirm": True})
    await hass.async_block_till_done()
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reset_done"
    for key in ("rain_today", "rain_week", "rain_month", "rain_year", "rain_total", "rain_last_24h"):
        assert float(_state(hass, entry, key)) == 0.0, key
    assert _state(hass, entry, "last_rain") == "unknown"
    # The options are untouched.
    assert entry.options == {"mm_per_tip": 0.5}

    # Counting starts again, and the reset survives a reload.
    hass.states.async_set(RAIN, "on")
    await hass.async_block_till_done()
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert float(_state(hass, entry, "rain_total")) == 0.5


async def test_reset_clears_the_rain_statistics(recorder_mock, hass: HomeAssistant) -> None:
    entry = await _setup_with_rain(hass)
    with patch.object(recorder_mock, "async_clear_statistics") as clear:
        await hass.services.async_call(
            DOMAIN, "reset_rain", {"config_entry_id": entry.entry_id}, blocking=True
        )
    cleared = set(clear.call_args.args[0])
    registry = er.async_get(hass)
    expected = {
        registry.async_get_entity_id("sensor", DOMAIN, f"{entry.entry_id}_{key}")
        for key in (
            "rain_today", "rain_week", "rain_month", "rain_year",
            "rain_last_hour", "rain_last_24h", "rain_rate", "rain_total",
        )
    }
    assert cleared == expected
    assert float(_state(hass, entry, "rain_total")) == 0.0


async def test_reset_action_rejects_an_unknown_station(hass: HomeAssistant) -> None:
    await _setup_with_rain(hass)
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN, "reset_rain", {"config_entry_id": "nope"}, blocking=True
        )
