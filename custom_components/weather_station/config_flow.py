from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er, selector

from .const import (
    CONF_BATTERY_ENTITY,
    CONF_DEBOUNCE_SECONDS,
    CONF_HUMIDITY_ENTITY,
    CONF_IMPORT_HISTORY,
    CONF_MM_PER_TIP,
    CONF_PRESSURE_ENTITY,
    CONF_RAIN_ENTITY,
    CONF_RAIN_WINDOW,
    CONF_STATION_NAME,
    CONF_ILLUMINANCE_ENTITY,
    CONF_SOLAR_RADIATION_ENTITY,
    CONF_TEMPERATURE_ENTITY,
    CONF_UV_ENTITY,
    CONF_WIND_DIRECTION_ENTITY,
    CONF_WIND_GUST_ENTITY,
    CONF_WIND_SPEED_ENTITY,
    DEFAULT_DEBOUNCE_SECONDS,
    DEFAULT_IMPORT_HISTORY,
    DEFAULT_MM_PER_TIP,
    DEFAULT_RAIN_WINDOW,
    DOMAIN,
)

DEFAULT_STATION_NAME = "Station météo"
CONF_CONFIRM = "confirm"

# Optional sensors of the station: config key and the sensor device class.
# Wind, UV and light sensors often lack a device class (or a direction sensor
# reports compass points), so any sensor is offered for them.
SENSOR_FIELDS = (
    (CONF_BATTERY_ENTITY, "battery"),
    (CONF_TEMPERATURE_ENTITY, "temperature"),
    (CONF_HUMIDITY_ENTITY, "humidity"),
    (CONF_PRESSURE_ENTITY, ["pressure", "atmospheric_pressure"]),
    (CONF_WIND_SPEED_ENTITY, None),
    (CONF_WIND_GUST_ENTITY, None),
    (CONF_WIND_DIRECTION_ENTITY, None),
    (CONF_UV_ENTITY, None),
    (CONF_ILLUMINANCE_ENTITY, None),
    (CONF_SOLAR_RADIATION_ENTITY, None),
)


def suggest_battery_entity(hass: HomeAssistant, rain_entity: str) -> str | None:
    """The battery sensor of the rain gauge's device, if any."""
    registry = er.async_get(hass)
    rain = registry.async_get(rain_entity)
    if rain is None or rain.device_id is None:
        return None
    for entry in er.async_entries_for_device(registry, rain.device_id):
        device_class = entry.device_class or entry.original_device_class
        if entry.domain == "sensor" and device_class == "battery":
            return entry.entity_id
    return None


def _sensor_selector(device_class) -> selector.EntitySelector:
    if device_class is None:
        return selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor"))
    return selector.EntitySelector(
        selector.EntitySelectorConfig(domain="sensor", device_class=device_class)
    )


def _sensors_schema(values: dict) -> vol.Schema:
    return vol.Schema({
        vol.Optional(key, description={"suggested_value": values.get(key)}): _sensor_selector(device_class)
        for key, device_class in SENSOR_FIELDS
    })


def _clean(user_input: dict) -> dict:
    """Optional sensors left empty are dropped."""
    return {key: user_input[key] for key, _device_class in SENSOR_FIELDS if user_input.get(key)}


RAIN_ENTITY_SELECTOR = selector.EntitySelector(
    selector.EntitySelectorConfig(domain="binary_sensor")
)
MM_PER_TIP_SELECTOR = selector.NumberSelector(
    selector.NumberSelectorConfig(
        min=0.01, max=10, step=0.001, unit_of_measurement="mm",
        mode=selector.NumberSelectorMode.BOX,
    )
)


class WeatherStationConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    def __init__(self) -> None:
        self._data: dict = {}
        self._mm_per_tip = DEFAULT_MM_PER_TIP

    async def async_step_user(self, user_input=None):
        errors = {}
        if user_input is not None:
            name = user_input[CONF_STATION_NAME].strip()
            if not name:
                errors[CONF_STATION_NAME] = "name_required"
            else:
                await self.async_set_unique_id(user_input[CONF_RAIN_ENTITY])
                self._abort_if_unique_id_configured()
                self._data = {
                    CONF_STATION_NAME: name,
                    CONF_RAIN_ENTITY: user_input[CONF_RAIN_ENTITY],
                    CONF_IMPORT_HISTORY: user_input[CONF_IMPORT_HISTORY],
                }
                self._mm_per_tip = user_input[CONF_MM_PER_TIP]
                return await self.async_step_sensors()

        defaults = user_input or {}
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required(
                    CONF_STATION_NAME, default=defaults.get(CONF_STATION_NAME, DEFAULT_STATION_NAME)
                ): str,
                vol.Required(
                    CONF_RAIN_ENTITY, default=defaults.get(CONF_RAIN_ENTITY, vol.UNDEFINED)
                ): RAIN_ENTITY_SELECTOR,
                vol.Required(
                    CONF_MM_PER_TIP, default=defaults.get(CONF_MM_PER_TIP, DEFAULT_MM_PER_TIP)
                ): MM_PER_TIP_SELECTOR,
                vol.Required(
                    CONF_IMPORT_HISTORY,
                    default=defaults.get(CONF_IMPORT_HISTORY, DEFAULT_IMPORT_HISTORY),
                ): selector.BooleanSelector(),
            }),
            errors=errors,
        )

    async def async_step_sensors(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(
                title=self._data[CONF_STATION_NAME],
                data={**self._data, **_clean(user_input)},
                options={
                    CONF_MM_PER_TIP: self._mm_per_tip,
                    CONF_DEBOUNCE_SECONDS: DEFAULT_DEBOUNCE_SECONDS,
                    CONF_RAIN_WINDOW: DEFAULT_RAIN_WINDOW,
                },
            )
        suggested = {
            CONF_BATTERY_ENTITY: suggest_battery_entity(self.hass, self._data[CONF_RAIN_ENTITY]),
        }
        return self.async_show_form(
            step_id="sensors",
            data_schema=_sensors_schema(suggested),
            description_placeholders={"station_name": self._data[CONF_STATION_NAME]},
        )

    async def async_step_reconfigure(self, user_input=None):
        entry = self._get_reconfigure_entry()
        errors = {}
        if user_input is not None:
            rain_entity = user_input[CONF_RAIN_ENTITY]
            other = next(
                (
                    other for other in self._async_current_entries(include_ignore=False)
                    if other.entry_id != entry.entry_id and other.unique_id == rain_entity
                ),
                None,
            )
            if other is not None:
                errors[CONF_RAIN_ENTITY] = "rain_already_used"
            else:
                data = {
                    key: value for key, value in entry.data.items()
                    if key not in dict(SENSOR_FIELDS)
                }
                data.update({CONF_RAIN_ENTITY: rain_entity, **_clean(user_input)})
                return self.async_update_reload_and_abort(
                    entry, unique_id=rain_entity, data=data
                )

        values = user_input or entry.data
        schema = vol.Schema({
            vol.Required(CONF_RAIN_ENTITY, default=values.get(CONF_RAIN_ENTITY)): RAIN_ENTITY_SELECTOR,
        }).extend(_sensors_schema(values).schema)
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=schema,
            errors=errors,
            description_placeholders={
                "station_name": entry.data.get(CONF_STATION_NAME, entry.title)
            },
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return WeatherStationOptionsFlow()


class WeatherStationOptionsFlow(config_entries.OptionsFlow):
    async def async_step_init(self, user_input=None):
        return self.async_show_menu(step_id="init", menu_options=["settings", "reset"])

    async def async_step_reset(self, user_input=None):
        """Start the rain totals again from zero, after a confirmation."""
        errors = {}
        if user_input is not None:
            if not user_input.get(CONF_CONFIRM):
                errors[CONF_CONFIRM] = "confirm_required"
            elif self.config_entry.state is not config_entries.ConfigEntryState.LOADED:
                return self.async_abort(reason="station_not_loaded")
            else:
                from . import async_reset_rain

                await async_reset_rain(self.hass, self.config_entry)
                return self.async_abort(reason="reset_done")
        return self.async_show_form(
            step_id="reset",
            data_schema=vol.Schema({
                vol.Required(CONF_CONFIRM, default=False): selector.BooleanSelector(),
            }),
            errors=errors,
            description_placeholders={
                "station_name": self.config_entry.data.get(CONF_STATION_NAME, self.config_entry.title)
            },
        )

    async def async_step_settings(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(data={**self.config_entry.options, **user_input})

        options = self.config_entry.options
        return self.async_show_form(
            step_id="settings",
            data_schema=vol.Schema({
                vol.Required(
                    CONF_MM_PER_TIP, default=options.get(CONF_MM_PER_TIP, DEFAULT_MM_PER_TIP)
                ): MM_PER_TIP_SELECTOR,
                vol.Required(
                    CONF_DEBOUNCE_SECONDS,
                    default=options.get(CONF_DEBOUNCE_SECONDS, DEFAULT_DEBOUNCE_SECONDS),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0, max=30, step=0.1, unit_of_measurement="s",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Required(
                    CONF_RAIN_WINDOW, default=options.get(CONF_RAIN_WINDOW, DEFAULT_RAIN_WINDOW)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=5, max=240, step=5, unit_of_measurement="min",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
            }),
        )
