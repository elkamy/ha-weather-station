from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.util import dt as dt_util

from .const import signal_updated
from .rain import RainGauge
from .sensor import rain_window, station_device_info


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities) -> None:
    async_add_entities([RainingSensor(entry, entry.runtime_data["rain"])])


class RainingSensor(BinarySensorEntity):
    """On while the gauge tipped within the rain window."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_translation_key = "raining"
    _attr_device_class = BinarySensorDeviceClass.MOISTURE

    def __init__(self, entry: ConfigEntry, gauge: RainGauge) -> None:
        self._entry = entry
        self._gauge = gauge
        self._attr_unique_id = f"{entry.entry_id}_raining"
        self._attr_device_info = station_device_info(entry)

    @property
    def is_on(self) -> bool:
        return self._gauge.is_raining(dt_util.now(), rain_window(self._entry))

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, signal_updated(self._entry.entry_id), self.async_write_ha_state
            )
        )
