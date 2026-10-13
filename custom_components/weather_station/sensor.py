from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timezone

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    UnitOfPrecipitationDepth,
    UnitOfTemperature,
    UnitOfVolumetricFlux,
)
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.util import dt as dt_util

from .const import (
    CONF_BATTERY_ENTITY,
    CONF_HUMIDITY_ENTITY,
    CONF_RAIN_ENTITY,
    CONF_RAIN_WINDOW,
    CONF_STATION_NAME,
    CONF_TEMPERATURE_ENTITY,
    CONF_WIND_SPEED_ENTITY,
    DEFAULT_RAIN_WINDOW,
    DOMAIN,
    EXTRA_SENSORS,
    signal_updated,
)
from .rain import RainGauge
from .weather import (
    apparent_temperature,
    dew_point,
    parse_direction,
    parse_number,
    to_celsius,
    to_meters_per_second,
)


def station_device_info(entry: ConfigEntry) -> DeviceInfo:
    """The station device, shared by all its entities."""
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name=entry.data.get(CONF_STATION_NAME, entry.title),
        manufacturer="Weather Station",
        model="Station météo",
    )


def rain_window(entry: ConfigEntry) -> float:
    try:
        window = float(entry.options.get(CONF_RAIN_WINDOW, DEFAULT_RAIN_WINDOW))
    except (TypeError, ValueError):
        return DEFAULT_RAIN_WINDOW
    return window if window > 0 else DEFAULT_RAIN_WINDOW


def _utc(timestamp: float | None) -> datetime | None:
    return datetime.fromtimestamp(timestamp, timezone.utc) if timestamp is not None else None


@dataclass(frozen=True)
class RainSensorDescription:
    key: str
    value: Callable[[RainGauge, datetime, float], float | datetime | None]
    device_class: SensorDeviceClass = SensorDeviceClass.PRECIPITATION
    state_class: SensorStateClass | None = SensorStateClass.MEASUREMENT
    unit: str | None = UnitOfPrecipitationDepth.MILLIMETERS
    icon: str | None = None


RAIN_SENSORS = (
    RainSensorDescription("rain_today", lambda g, now, _w: g.period_amount("day", now)),
    RainSensorDescription("rain_week", lambda g, now, _w: g.period_amount("week", now)),
    RainSensorDescription("rain_month", lambda g, now, _w: g.period_amount("month", now)),
    RainSensorDescription("rain_year", lambda g, now, _w: g.period_amount("year", now)),
    RainSensorDescription("rain_last_hour", lambda g, now, _w: g.rolling_amount(3600, now)),
    RainSensorDescription("rain_last_24h", lambda g, now, _w: g.rolling_amount(86400, now)),
    RainSensorDescription(
        "rain_rate",
        lambda g, now, w: g.rate(now, w),
        device_class=SensorDeviceClass.PRECIPITATION_INTENSITY,
        unit=UnitOfVolumetricFlux.MILLIMETERS_PER_HOUR,
    ),
    # Never decreases, so Home Assistant keeps long-term statistics (sums).
    RainSensorDescription(
        "rain_total",
        lambda g, _now, _w: g.total,
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    RainSensorDescription(
        "last_rain",
        lambda g, _now, _w: _utc(g.last_tip),
        device_class=SensorDeviceClass.TIMESTAMP,
        state_class=None,
        unit=None,
        icon="mdi:weather-rainy",
    ),
)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities) -> None:
    gauge = entry.runtime_data["rain"]
    entities: list[SensorEntity] = [
        RainSensor(entry, gauge, description)
        for description in RAIN_SENSORS
        if description.key != "rain_today"
    ]
    if has_comfort_sensors(entry):
        entities += [
            ComfortSensor(entry, "dew_point", "mdi:thermometer-water"),
            ComfortSensor(entry, "feels_like", "mdi:thermometer-lines"),
        ]
    # Added last: its `entities` attribute lists the entity IDs of the others,
    # which must already be registered.
    entities.append(StationSensor(entry, gauge))
    async_add_entities(entities)


def has_comfort_sensors(entry: ConfigEntry) -> bool:
    """Dew point and feels-like temperature need temperature and humidity."""
    return bool(entry.data.get(CONF_TEMPERATURE_ENTITY) and entry.data.get(CONF_HUMIDITY_ENTITY))


def _reading(hass: HomeAssistant, entity_id: str | None) -> tuple[float | None, str | None]:
    """Numeric state and unit of a sensor; None when missing or not numeric."""
    state = hass.states.get(entity_id) if entity_id else None
    if state is None:
        return None, None
    return parse_number(state.state), state.attributes.get("unit_of_measurement")


class RainSensor(SensorEntity):
    """A rain reading, refreshed on every tip and every minute."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, entry: ConfigEntry, gauge: RainGauge, description: RainSensorDescription) -> None:
        self._entry = entry
        self._gauge = gauge
        self._description = description
        self._attr_unique_id = f"{entry.entry_id}_{description.key}"
        self._attr_translation_key = description.key
        self._attr_device_info = station_device_info(entry)
        self._attr_device_class = description.device_class
        self._attr_state_class = description.state_class
        self._attr_native_unit_of_measurement = description.unit
        if description.icon:
            self._attr_icon = description.icon
        if description.unit == UnitOfPrecipitationDepth.MILLIMETERS:
            self._attr_suggested_display_precision = 1

    @property
    def native_value(self):
        return self._description.value(self._gauge, dt_util.now(), rain_window(self._entry))

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, signal_updated(self._entry.entry_id), self.async_write_ha_state
            )
        )


class StationSensor(RainSensor):
    """Today's rain, carrying every reading of the station for the card.

    Its attributes (`weather_station: true`, …) are the contract consumed by
    the Lovelace card.
    """

    # The chart and the mirrored readings change all the time and are recorded
    # elsewhere; keep them out of the database.
    _unrecorded_attributes = frozenset({
        "hourly_rain", "rain_week", "rain_month", "rain_year", "rain_last_hour",
        "rain_last_24h", "rain_rate", "rain_total", "last_rain", "raining", "battery",
        "entities", "dew_point", "dew_point_unit", "feels_like", "feels_like_unit",
        *(attribute for _key, attribute in EXTRA_SENSORS),
        *(f"{attribute}_unit" for _key, attribute in EXTRA_SENSORS),
    })

    def __init__(self, entry: ConfigEntry, gauge: RainGauge) -> None:
        super().__init__(entry, gauge, RAIN_SENSORS[0])

    def _watched(self) -> list[str]:
        keys = [CONF_BATTERY_ENTITY, *(key for key, _attribute in EXTRA_SENSORS)]
        return [entity for key in keys if (entity := self._entry.data.get(key))]

    def _entities(self) -> dict[str, str]:
        """Entity IDs of every reading, for the card's history and statistics."""
        data = self._entry.data
        entities = {
            attribute: data[key] for key, attribute in EXTRA_SENSORS if data.get(key)
        }
        registry = er.async_get(self.hass)
        for key in ("rain_total", "dew_point", "feels_like"):
            entity_id = registry.async_get_entity_id(
                "sensor", DOMAIN, f"{self._entry.entry_id}_{key}"
            )
            if entity_id:
                entities[key] = entity_id
        return entities

    @property
    def extra_state_attributes(self) -> dict:
        now = dt_util.now()
        window = rain_window(self._entry)
        gauge = self._gauge
        data = self._entry.data
        attributes = {
            "weather_station": True,
            "station_name": data.get(CONF_STATION_NAME, self._entry.title),
            "rain_entity": data.get(CONF_RAIN_ENTITY),
            "rain_week": gauge.period_amount("week", now),
            "rain_month": gauge.period_amount("month", now),
            "rain_year": gauge.period_amount("year", now),
            "rain_last_hour": gauge.rolling_amount(3600, now),
            "rain_last_24h": gauge.rolling_amount(86400, now),
            "rain_rate": gauge.rate(now, window),
            "rain_total": gauge.total,
            "last_rain": _utc(gauge.last_tip).isoformat() if gauge.last_tip else None,
            "raining": gauge.is_raining(now, window),
            "hourly_rain": gauge.hourly(now),
            "mm_per_tip": gauge.mm_per_tip,
            "battery": _reading(self.hass, data.get(CONF_BATTERY_ENTITY))[0],
            "entities": self._entities(),
        }
        for key, attribute in EXTRA_SENSORS:
            if not data.get(key):
                continue
            value, unit = _reading(self.hass, data[key])
            if attribute == "wind_direction":
                # Degrees, or a compass point such as "NW".
                state = self.hass.states.get(data[key])
                value = parse_direction(state.state) if state else None
                unit = "°"
            attributes[attribute] = value
            attributes[f"{attribute}_unit"] = unit
        if has_comfort_sensors(self._entry):
            for key in ("dew_point", "feels_like"):
                attributes[key] = comfort_value(self.hass, self._entry, key)
                attributes[f"{key}_unit"] = UnitOfTemperature.CELSIUS
        return attributes

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()

        @callback
        def _changed(_event: Event) -> None:
            self.async_write_ha_state()

        if watched := self._watched():
            self.async_on_remove(async_track_state_change_event(self.hass, watched, _changed))


def comfort_value(hass: HomeAssistant, entry: ConfigEntry, key: str) -> float | None:
    """Dew point or feels-like temperature (°C) from the station's sensors."""
    temperature = to_celsius(*_reading(hass, entry.data.get(CONF_TEMPERATURE_ENTITY)))
    humidity = _reading(hass, entry.data.get(CONF_HUMIDITY_ENTITY))[0]
    if temperature is None or humidity is None:
        return None
    if key == "dew_point":
        return dew_point(temperature, humidity)
    wind = to_meters_per_second(*_reading(hass, entry.data.get(CONF_WIND_SPEED_ENTITY)))
    return apparent_temperature(temperature, humidity, wind)


class ComfortSensor(SensorEntity):
    """Dew point or feels-like temperature, computed from the station."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
    _attr_suggested_display_precision = 1

    def __init__(self, entry: ConfigEntry, key: str, icon: str) -> None:
        self._entry = entry
        self._key = key
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_translation_key = key
        self._attr_icon = icon
        self._attr_device_info = station_device_info(entry)

    @property
    def native_value(self) -> float | None:
        return comfort_value(self.hass, self._entry, self._key)

    async def async_added_to_hass(self) -> None:
        sources = [
            entity
            for key in (CONF_TEMPERATURE_ENTITY, CONF_HUMIDITY_ENTITY, CONF_WIND_SPEED_ENTITY)
            if (entity := self._entry.data.get(key))
        ]

        @callback
        def _changed(_event: Event) -> None:
            self.async_write_ha_state()

        self.async_on_remove(async_track_state_change_event(self.hass, sources, _changed))
