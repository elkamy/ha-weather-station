from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import dt as dt_util

from .alerts import frost_alert, to_kmh, wind_alert
from .const import (
    CONF_FROST_THRESHOLD,
    CONF_STATION_NAME,
    CONF_TEMPERATURE_ENTITY,
    CONF_WIND_GUST_ENTITY,
    CONF_WIND_SPEED_ENTITY,
    CONF_WIND_THRESHOLD,
    DEFAULT_FROST_THRESHOLD,
    DEFAULT_WIND_THRESHOLD,
    EVENT_ALERT,
    signal_updated,
)
from .rain import RainGauge
from .sensor import _reading, rain_window, station_device_info
from .weather import to_celsius


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities) -> None:
    entities: list[AlertSensor] = [RainingSensor(entry, entry.runtime_data["rain"])]
    if entry.data.get(CONF_TEMPERATURE_ENTITY):
        entities.append(FrostSensor(entry))
    if wind_source(entry):
        entities.append(StrongWindSensor(entry))
    async_add_entities(entities)


def wind_source(entry: ConfigEntry) -> str | None:
    """Gusts tell strong wind best; the mean wind speed otherwise."""
    return entry.data.get(CONF_WIND_GUST_ENTITY) or entry.data.get(CONF_WIND_SPEED_ENTITY)


def _threshold(entry: ConfigEntry, key: str, default: float) -> float:
    try:
        return float(entry.options.get(key, default))
    except (TypeError, ValueError):
        return default


class AlertSensor(RestoreEntity, BinarySensorEntity):
    """An alert episode, announced by an event when it starts and ends.

    The state is restored at startup, so a restart never announces again an
    episode already under way.
    """

    _attr_has_entity_name = True
    _attr_should_poll = False
    # Alert name in the event (frost, strong_wind, rain).
    alert: str
    unit: str | None = None

    def __init__(self, entry: ConfigEntry, key: str) -> None:
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_translation_key = key
        self._attr_device_info = station_device_info(entry)
        self._attr_is_on = None
        self._value: float | None = None

    def _sources(self) -> list[str]:
        return []

    def _evaluate(self) -> bool | None:
        """New state of the alert; None keeps the current one."""
        raise NotImplementedError

    def _threshold(self) -> float | None:
        return None

    @property
    def extra_state_attributes(self) -> dict:
        return {"value": self._value, "threshold": self._threshold(), "unit": self.unit}

    @callback
    def _refresh(self, *_args) -> None:
        active = self._evaluate()
        if active is None or active == self._attr_is_on:
            self.async_write_ha_state()
            return
        # No event for the first evaluation of a new sensor: nothing started.
        announce = self._attr_is_on is not None
        self._attr_is_on = active
        self.async_write_ha_state()
        if announce:
            self.hass.bus.async_fire(EVENT_ALERT, {
                "config_entry_id": self._entry.entry_id,
                "station_name": self._entry.data.get(CONF_STATION_NAME, self._entry.title),
                "alert": self.alert,
                "active": active,
                "value": self._value,
                "threshold": self._threshold(),
                "unit": self.unit,
                "entity_id": self.entity_id,
            })

    async def async_added_to_hass(self) -> None:
        if (last := await self.async_get_last_state()) is not None and last.state in ("on", "off"):
            self._attr_is_on = last.state == "on"
        self.async_on_remove(
            async_dispatcher_connect(self.hass, signal_updated(self._entry.entry_id), self._refresh)
        )
        if sources := self._sources():
            self.async_on_remove(async_track_state_change_event(self.hass, sources, self._refresh))
        self._refresh()


class RainingSensor(AlertSensor):
    """On while the gauge tipped within the rain window."""

    _attr_device_class = BinarySensorDeviceClass.MOISTURE
    alert = "rain"
    unit = "mm"

    def __init__(self, entry: ConfigEntry, gauge: RainGauge) -> None:
        super().__init__(entry, "raining")
        self._gauge = gauge

    def _evaluate(self) -> bool:
        now = dt_util.now()
        self._value = self._gauge.period_amount("day", now)
        return self._gauge.is_raining(now, rain_window(self._entry))


class FrostSensor(AlertSensor):
    """On while the air temperature is at or below the frost threshold."""

    _attr_device_class = BinarySensorDeviceClass.COLD
    alert = "frost"
    unit = "°C"

    def __init__(self, entry: ConfigEntry) -> None:
        super().__init__(entry, "frost")

    def _sources(self) -> list[str]:
        return [self._entry.data[CONF_TEMPERATURE_ENTITY]]

    def _threshold(self) -> float:
        return _threshold(self._entry, CONF_FROST_THRESHOLD, DEFAULT_FROST_THRESHOLD)

    def _evaluate(self) -> bool | None:
        temperature = to_celsius(*_reading(self.hass, self._entry.data[CONF_TEMPERATURE_ENTITY]))
        self._value = None if temperature is None else round(temperature, 1)
        return frost_alert(self._attr_is_on, temperature, self._threshold())


class StrongWindSensor(AlertSensor):
    """On while the gusts (or the mean wind) reach the strong wind threshold."""

    alert = "strong_wind"
    unit = "km/h"

    def __init__(self, entry: ConfigEntry) -> None:
        super().__init__(entry, "strong_wind")

    def _sources(self) -> list[str]:
        return [wind_source(self._entry)]

    def _threshold(self) -> float:
        return _threshold(self._entry, CONF_WIND_THRESHOLD, DEFAULT_WIND_THRESHOLD)

    def _evaluate(self) -> bool | None:
        wind = to_kmh(*_reading(self.hass, wind_source(self._entry)))
        self._value = None if wind is None else round(wind, 1)
        return wind_alert(self._attr_is_on, wind, self._threshold())

    @property
    def icon(self) -> str:
        return "mdi:weather-windy-variant" if self.is_on else "mdi:weather-windy"
