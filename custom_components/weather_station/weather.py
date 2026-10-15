"""The station as a weather entity: its readings, and forecasts lent by another one."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.weather import (
    ATTR_WEATHER_PRECIPITATION_UNIT,
    ATTR_WEATHER_PRESSURE_UNIT,
    ATTR_WEATHER_TEMPERATURE_UNIT,
    ATTR_WEATHER_WIND_SPEED_UNIT,
    Forecast,
    WeatherEntity,
    WeatherEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_SUPPORTED_FEATURES,
    UnitOfPrecipitationDepth,
    UnitOfPressure,
    UnitOfSpeed,
    UnitOfTemperature,
)
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.util import dt as dt_util
from homeassistant.util.unit_conversion import (
    DistanceConverter,
    PressureConverter,
    SpeedConverter,
    TemperatureConverter,
)

from .const import (
    CONF_FORECAST_ENTITY,
    CONF_HUMIDITY_ENTITY,
    CONF_ILLUMINANCE_ENTITY,
    CONF_PRESSURE_ENTITY,
    CONF_SOLAR_RADIATION_ENTITY,
    CONF_TEMPERATURE_ENTITY,
    CONF_UV_ENTITY,
    CONF_WIND_DIRECTION_ENTITY,
    CONF_WIND_GUST_ENTITY,
    CONF_WIND_SPEED_ENTITY,
    DOMAIN,
    signal_updated,
)
from .meteo import LUX_PER_WATT, parse_direction, sky_condition, station_condition
from .rain import RainGauge
from .sensor import (
    _reading,
    comfort_value,
    convert_reading as _convert,
    has_comfort_sensors,
    rain_window,
    station_device_info,
)

_LOGGER = logging.getLogger(__name__)
SUN = "sun.sun"
FORECAST_FEATURES = (
    WeatherEntityFeature.FORECAST_DAILY
    | WeatherEntityFeature.FORECAST_TWICE_DAILY
    | WeatherEntityFeature.FORECAST_HOURLY
)
# Forecast fields and the source unit attribute they are expressed in.
FORECAST_UNITS = {
    "temperature": (ATTR_WEATHER_TEMPERATURE_UNIT, TemperatureConverter, UnitOfTemperature.CELSIUS),
    "templow": (ATTR_WEATHER_TEMPERATURE_UNIT, TemperatureConverter, UnitOfTemperature.CELSIUS),
    "apparent_temperature": (ATTR_WEATHER_TEMPERATURE_UNIT, TemperatureConverter, UnitOfTemperature.CELSIUS),
    "dew_point": (ATTR_WEATHER_TEMPERATURE_UNIT, TemperatureConverter, UnitOfTemperature.CELSIUS),
    "pressure": (ATTR_WEATHER_PRESSURE_UNIT, PressureConverter, UnitOfPressure.HPA),
    "wind_speed": (ATTR_WEATHER_WIND_SPEED_UNIT, SpeedConverter, UnitOfSpeed.KILOMETERS_PER_HOUR),
    "wind_gust_speed": (ATTR_WEATHER_WIND_SPEED_UNIT, SpeedConverter, UnitOfSpeed.KILOMETERS_PER_HOUR),
    "precipitation": (ATTR_WEATHER_PRECIPITATION_UNIT, DistanceConverter, UnitOfPrecipitationDepth.MILLIMETERS),
}


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities) -> None:
    async_add_entities([StationWeather(entry, entry.runtime_data["rain"])])


def convert_forecast(forecast: list[dict] | None, source_attributes: dict) -> list[Forecast] | None:
    """Forecast of another weather entity, in this entity's native units.

    The weather.get_forecasts action answers in the source's displayed units,
    given by its unit attributes.
    """
    if forecast is None:
        return None
    converted = []
    for item in forecast:
        item = dict(item)
        for key, (unit_attribute, converter, target) in FORECAST_UNITS.items():
            value = item.get(key)
            if isinstance(value, (int, float)):
                result = _convert(converter, float(value), source_attributes.get(unit_attribute), target)
                item[key] = None if result is None else round(result, 2)
        converted.append(item)
    return converted


class StationWeather(WeatherEntity):
    """What the station measures now, as a weather entity.

    The condition comes from the station's own sensors (rain, strong wind, sun)
    and otherwise from the optional forecast entity, which also lends its
    forecasts.
    """

    _attr_has_entity_name = True
    _attr_name = None
    _attr_should_poll = False
    _attr_native_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_native_pressure_unit = UnitOfPressure.HPA
    _attr_native_wind_speed_unit = UnitOfSpeed.KILOMETERS_PER_HOUR
    _attr_native_precipitation_unit = UnitOfPrecipitationDepth.MILLIMETERS

    def __init__(self, entry: ConfigEntry, gauge: RainGauge) -> None:
        self._entry = entry
        self._gauge = gauge
        self._attr_unique_id = f"{entry.entry_id}_weather"
        self._attr_device_info = station_device_info(entry)

    # ------------------------------------------------------------ sources

    def _value(self, key: str) -> tuple[float | None, str | None]:
        return _reading(self.hass, self._entry.data.get(key))

    def _forecast_source(self) -> str | None:
        """The forecast entity, never one of this integration (no loop)."""
        source = self._entry.data.get(CONF_FORECAST_ENTITY)
        if not source or source == self.entity_id:
            return None
        entry = er.async_get(self.hass).async_get(source)
        if entry is not None and entry.platform == DOMAIN:
            return None
        return source

    def _alert_on(self, key: str) -> bool:
        entity_id = er.async_get(self.hass).async_get_entity_id(
            "binary_sensor", DOMAIN, f"{self._entry.entry_id}_{key}"
        )
        state = self.hass.states.get(entity_id) if entity_id else None
        return state is not None and state.state == "on"

    # ------------------------------------------------------------ readings

    @property
    def condition(self) -> str | None:
        now = dt_util.now()
        raining = self._gauge.is_raining(now, rain_window(self._entry))
        irradiance, _unit = self._value(CONF_SOLAR_RADIATION_ENTITY)
        if irradiance is None:
            lux, _unit = self._value(CONF_ILLUMINANCE_ENTITY)
            irradiance = None if lux is None else lux / LUX_PER_WATT
        sun = self.hass.states.get(SUN)
        elevation = sun.attributes.get("elevation") if sun else None
        source = self._forecast_source()
        source_state = self.hass.states.get(source) if source else None
        return station_condition(
            raining,
            self._gauge.rate(now, rain_window(self._entry)),
            self._alert_on("strong_wind"),
            sky_condition(irradiance, elevation),
            source_state.state if source_state else None,
        )

    @property
    def native_temperature(self) -> float | None:
        value, unit = self._value(CONF_TEMPERATURE_ENTITY)
        return _convert(TemperatureConverter, value, unit, UnitOfTemperature.CELSIUS)

    @property
    def native_apparent_temperature(self) -> float | None:
        return comfort_value(self.hass, self._entry, "feels_like") if has_comfort_sensors(self._entry) else None

    @property
    def native_dew_point(self) -> float | None:
        return comfort_value(self.hass, self._entry, "dew_point") if has_comfort_sensors(self._entry) else None

    @property
    def humidity(self) -> float | None:
        return self._value(CONF_HUMIDITY_ENTITY)[0]

    @property
    def native_pressure(self) -> float | None:
        value, unit = self._value(CONF_PRESSURE_ENTITY)
        return _convert(PressureConverter, value, unit, UnitOfPressure.HPA)

    @property
    def native_wind_speed(self) -> float | None:
        value, unit = self._value(CONF_WIND_SPEED_ENTITY)
        return _convert(SpeedConverter, value, unit, UnitOfSpeed.KILOMETERS_PER_HOUR)

    @property
    def native_wind_gust_speed(self) -> float | None:
        value, unit = self._value(CONF_WIND_GUST_ENTITY)
        return _convert(SpeedConverter, value, unit, UnitOfSpeed.KILOMETERS_PER_HOUR)

    @property
    def wind_bearing(self) -> float | None:
        entity_id = self._entry.data.get(CONF_WIND_DIRECTION_ENTITY)
        state = self.hass.states.get(entity_id) if entity_id else None
        return parse_direction(state.state) if state else None

    @property
    def uv_index(self) -> float | None:
        return self._value(CONF_UV_ENTITY)[0]

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        now = dt_util.now()
        return {
            "rain_today": self._gauge.period_amount("day", now),
            "rain_rate": self._gauge.rate(now, rain_window(self._entry)),
            "forecast_entity": self._forecast_source(),
        }

    # ----------------------------------------------------------- forecasts

    @property
    def supported_features(self) -> WeatherEntityFeature:
        source = self._forecast_source()
        state = self.hass.states.get(source) if source else None
        if state is None:
            return WeatherEntityFeature(0)
        return WeatherEntityFeature(int(state.attributes.get(ATTR_SUPPORTED_FEATURES) or 0) & FORECAST_FEATURES)

    async def _async_forecast(self, kind: str) -> list[Forecast] | None:
        source = self._forecast_source()
        state = self.hass.states.get(source) if source else None
        if state is None:
            return None
        try:
            response = await self.hass.services.async_call(
                "weather",
                "get_forecasts",
                {"entity_id": source, "type": kind},
                blocking=True,
                return_response=True,
            )
        except HomeAssistantError as error:
            _LOGGER.debug("Weather Station: no %s forecast from %s: %s", kind, source, error)
            return None
        forecast = ((response or {}).get(source) or {}).get("forecast")
        return convert_forecast(forecast, state.attributes)

    async def async_forecast_daily(self) -> list[Forecast] | None:
        return await self._async_forecast("daily")

    async def async_forecast_twice_daily(self) -> list[Forecast] | None:
        return await self._async_forecast("twice_daily")

    async def async_forecast_hourly(self) -> list[Forecast] | None:
        return await self._async_forecast("hourly")

    # ------------------------------------------------------------- updates

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, signal_updated(self._entry.entry_id), self.async_write_ha_state
            )
        )
        data = self._entry.data
        watched = [
            entity_id
            for key in (
                CONF_TEMPERATURE_ENTITY, CONF_HUMIDITY_ENTITY, CONF_PRESSURE_ENTITY,
                CONF_WIND_SPEED_ENTITY, CONF_WIND_GUST_ENTITY, CONF_WIND_DIRECTION_ENTITY,
                CONF_UV_ENTITY, CONF_ILLUMINANCE_ENTITY, CONF_SOLAR_RADIATION_ENTITY,
            )
            if (entity_id := data.get(key))
        ]
        watched.append(SUN)
        alerts = [
            entity_id
            for key in ("strong_wind",)
            if (entity_id := er.async_get(self.hass).async_get_entity_id(
                "binary_sensor", DOMAIN, f"{self._entry.entry_id}_{key}"
            ))
        ]

        @callback
        def _changed(_event: Event) -> None:
            self.async_write_ha_state()

        self.async_on_remove(async_track_state_change_event(self.hass, watched + alerts, _changed))

        if source := self._forecast_source():
            async def _source_changed(_event: Event) -> None:
                self.async_write_ha_state()
                # Forecast cards subscribed to this entity fetch them again.
                await self.async_update_listeners(None)

            self.async_on_remove(async_track_state_change_event(self.hass, [source], _source_changed))
