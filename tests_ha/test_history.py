"""Import of the tips kept by the recorder."""

from datetime import timedelta

from freezegun import freeze_time
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_wait_recording_done,
)

from custom_components.weather_station.const import DOMAIN

RAIN = "binary_sensor.capteur_pluie_contact"


async def test_imports_recorded_tips(recorder_mock, hass: HomeAssistant) -> None:
    start = dt_util.now() - timedelta(minutes=10)
    for index, state in enumerate(("on", "off", "on", "off")):
        with freeze_time(start + timedelta(minutes=index)):
            hass.states.async_set(RAIN, state)
            await hass.async_block_till_done()
    await async_wait_recording_done(hass)

    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Jardin",
        unique_id=RAIN,
        data={"station_name": "Jardin", "rain_entity": RAIN, "import_history": True},
        options={"mm_per_tip": 0.5},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    total = next(
        item.entity_id
        for item in er.async_entries_for_config_entry(er.async_get(hass), entry.entry_id)
        if item.unique_id.endswith("_rain_total")
    )
    # Three changes after the first "on": 1.5 mm.
    assert float(hass.states.get(total).state) == 1.5
