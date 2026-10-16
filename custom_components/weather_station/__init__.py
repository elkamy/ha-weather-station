from __future__ import annotations

import asyncio
import logging
from datetime import timedelta
from pathlib import Path

from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.core import Event, HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import ServiceValidationError
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers import entity_registry as er
import voluptuous as vol
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    CONF_DEBOUNCE_SECONDS,
    CONF_IMPORT_HISTORY,
    CONF_MM_PER_TIP,
    CONF_RAIN_ENTITY,
    CONF_TEMPERATURE_ENTITY,
    DEFAULT_DEBOUNCE_SECONDS,
    DEFAULT_IMPORT_HISTORY,
    DEFAULT_MM_PER_TIP,
    DOMAIN,
    EXTRA_SENSORS,
    PANEL_ICON,
    PANEL_URL_PATH,
    UPDATE_INTERVAL_SECONDS,
    signal_updated,
)
from .rain import RainGauge, is_tip, tips_from_history

_LOGGER = logging.getLogger(__name__)
PLATFORMS = ["sensor", "binary_sensor", "weather"]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

RAIN_STORE_KEY = f"{DOMAIN}.rain"
SERVICE_RESET_RAIN = "reset_rain"
ATTR_CONFIG_ENTRY_ID = "config_entry_id"
STORE_VERSION = 1
CARD_FILES = ("weather-station-card.js", "weather-station-dashboard.js")
# Bump when changing the card JavaScript to invalidate browser caches.
CARD_VERSION = "0.7.2"
DASHBOARD_URL = f"/{DOMAIN}/weather-station-dashboard.js?v={CARD_VERSION}"
PANEL_TITLES = {"fr": "Météo", "en": "Weather"}


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Serve the Lovelace cards and load them in every dashboard."""
    from homeassistant.components.frontend import add_extra_js_url
    from homeassistant.components.http import StaticPathConfig

    www = Path(__file__).parent / "www"
    await hass.http.async_register_static_paths([
        StaticPathConfig(f"/{DOMAIN}/{filename}", str(www / filename), cache_headers=True)
        for filename in CARD_FILES
    ])
    for filename in CARD_FILES:
        add_extra_js_url(hass, f"/{DOMAIN}/{filename}?v={CARD_VERSION}")
    hass.data.setdefault(DOMAIN, {})
    return True


async def _async_register_panel(hass: HomeAssistant) -> None:
    """Add the weather dashboard to the sidebar, once for every station."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get("_panel") or "frontend" not in hass.config.components:
        return
    from homeassistant.components import panel_custom

    language = (hass.config.language or "en").split("-")[0]
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name="weather-station-panel",
        sidebar_title=PANEL_TITLES.get(language, PANEL_TITLES["en"]),
        sidebar_icon=PANEL_ICON,
        module_url=DASHBOARD_URL,
        require_admin=False,
    )
    domain_data["_panel"] = True


@callback
def _async_remove_panel(hass: HomeAssistant) -> None:
    domain_data = hass.data.get(DOMAIN, {})
    if not domain_data.pop("_panel", False):
        return
    from homeassistant.components.frontend import async_remove_panel

    async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)


async def _async_store(hass: HomeAssistant) -> tuple[Store, dict]:
    """The rain store shared by all stations, with its loaded data."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if "_store" not in domain_data:
        # Entries set up concurrently share one load through this future.
        loaded = asyncio.get_running_loop().create_future()
        domain_data["_store"] = loaded
        store = Store(hass, STORE_VERSION, RAIN_STORE_KEY)
        try:
            data = await store.async_load() or {}
        except Exception:  # noqa: BLE001 - a corrupt file must not block setup
            _LOGGER.warning("Weather Station: could not load the rain store", exc_info=True)
            data = {}
        loaded.set_result((store, data))
    return await domain_data["_store"]


def rain_gauge_settings(entry: ConfigEntry) -> tuple[float, float]:
    """Calibration and debounce of the entry, with their defaults."""
    try:
        mm_per_tip = float(entry.options.get(CONF_MM_PER_TIP, DEFAULT_MM_PER_TIP))
    except (TypeError, ValueError):
        mm_per_tip = DEFAULT_MM_PER_TIP
    try:
        debounce = float(entry.options.get(CONF_DEBOUNCE_SECONDS, DEFAULT_DEBOUNCE_SECONDS))
    except (TypeError, ValueError):
        debounce = DEFAULT_DEBOUNCE_SECONDS
    return (mm_per_tip if mm_per_tip > 0 else DEFAULT_MM_PER_TIP), max(debounce, 0.0)


async def _async_import_history(hass: HomeAssistant, gauge: RainGauge, entity_id: str) -> int:
    """Replay the tips still kept by the recorder; returns how many were added."""
    try:
        from homeassistant.components.recorder import get_instance, history
    except ImportError:
        return 0
    if "recorder" not in hass.config.components:
        return 0
    now = dt_util.now()
    start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    try:
        states = await get_instance(hass).async_add_executor_job(
            lambda: history.state_changes_during_period(
                hass, start, now, entity_id, no_attributes=True, include_start_time_state=False
            )
        )
    except Exception:  # noqa: BLE001 - the import is a convenience only
        _LOGGER.warning("Weather Station: could not read the history of %s", entity_id, exc_info=True)
        return 0
    changes = [(state.state, state.last_changed) for state in states.get(entity_id, [])]
    added = 0
    for moment in tips_from_history(changes):
        if gauge.add_tip(dt_util.as_local(moment)):
            added += 1
    gauge.prune(now)
    return added


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    store, store_data = await _async_store(hass)
    rain_entity = entry.data[CONF_RAIN_ENTITY]
    mm_per_tip, debounce = rain_gauge_settings(entry)
    stored = store_data.get(entry.entry_id) or {}
    # Tips counted on another sensor (changed through Reconfigure) are dropped.
    gauge = RainGauge.from_dict(
        stored if stored.get("entity") == rain_entity else None, mm_per_tip, debounce
    )

    @callback
    def _save() -> None:
        store_data[entry.entry_id] = {**gauge.as_dict(), "entity": rain_entity}
        store.async_delay_save(lambda: store_data, 10)

    async def _save_now() -> None:
        store_data[entry.entry_id] = {**gauge.as_dict(), "entity": rain_entity}
        await store.async_save(store_data)

    entry.runtime_data = {"rain": gauge, "save_now": _save_now}

    if not stored and entry.data.get(CONF_IMPORT_HISTORY, DEFAULT_IMPORT_HISTORY):
        added = await _async_import_history(hass, gauge, rain_entity)
        _LOGGER.info("Weather Station: imported %s tips of %s", added, rain_entity)
    _save()

    @callback
    def _rain_changed(event: Event) -> None:
        old, new = event.data.get("old_state"), event.data.get("new_state")
        if new is None or not is_tip(old.state if old else None, new.state):
            return
        if gauge.add_tip(dt_util.as_local(new.last_changed)):
            _save()
            async_dispatcher_send(hass, signal_updated(entry.entry_id))

    @callback
    def _tick(_now) -> None:
        # Rolling totals, intensity and period resets depend on time alone.
        gauge.prune(dt_util.now())
        async_dispatcher_send(hass, signal_updated(entry.entry_id))

    entry.async_on_unload(async_track_state_change_event(hass, [rain_entity], _rain_changed))
    entry.async_on_unload(
        async_track_time_interval(hass, _tick, timedelta(seconds=UPDATE_INTERVAL_SECONDS))
    )
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    _async_remove_orphan_entities(hass, entry)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    # Every entity is registered now: the station lists them all for the cards.
    async_dispatcher_send(hass, signal_updated(entry.entry_id))
    await _async_register_panel(hass)
    _async_register_services(hass)
    return True


def expected_unique_ids(entry: ConfigEntry) -> set[str]:
    """Unique IDs of the entities the station provides with its current sensors."""
    from .binary_sensor import wind_source
    from .sensor import RAIN_SENSORS, has_comfort_sensors

    keys = {description.key for description in RAIN_SENSORS} | {"raining", "weather"}
    if has_comfort_sensors(entry):
        keys |= {"dew_point", "feels_like"}
    if entry.data.get(CONF_TEMPERATURE_ENTITY):
        keys.add("frost")
    if wind_source(entry):
        keys.add("strong_wind")
    # The station's own copy of each configured reading.
    keys |= {attribute for key, attribute in EXTRA_SENSORS if entry.data.get(key)}
    return {f"{entry.entry_id}_{key}" for key in keys}


@callback
def _async_remove_orphan_entities(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Forget the entities whose sensor was removed (Reconfigure).

    Without this, the frost risk would stay "unavailable" forever once the
    thermometer is removed.
    """
    registry = er.async_get(hass)
    expected = expected_unique_ids(entry)
    for entity in er.async_entries_for_config_entry(registry, entry.entry_id):
        if entity.unique_id not in expected:
            _LOGGER.info("Weather Station: removing %s, its sensor is gone", entity.entity_id)
            registry.async_remove(entity.entity_id)


def rain_statistic_ids(hass: HomeAssistant, entry: ConfigEntry) -> list[str]:
    """Entity IDs of the station's rain sensors that have long-term statistics."""
    from .sensor import RAIN_SENSORS

    registry = er.async_get(hass)
    return [
        entity_id
        for description in RAIN_SENSORS
        if description.state_class is not None
        and (entity_id := registry.async_get_entity_id(
            "sensor", DOMAIN, f"{entry.entry_id}_{description.key}"
        ))
    ]


async def async_reset_rain(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Start every rain total again from zero, charts included.

    The tips are forgotten and the long-term statistics of the rain sensors
    are cleared, so the 7 / 30 days and monthly charts start again too.
    """
    runtime = entry.runtime_data
    runtime["rain"].reset()
    await runtime["save_now"]()
    if "recorder" in hass.config.components:
        from homeassistant.components.recorder import get_instance

        if statistic_ids := rain_statistic_ids(hass, entry):
            get_instance(hass).async_clear_statistics(statistic_ids)
    _LOGGER.info("Weather Station: rain measurements of %s reset", entry.title)
    async_dispatcher_send(hass, signal_updated(entry.entry_id))


@callback
def _async_register_services(hass: HomeAssistant) -> None:
    if hass.services.has_service(DOMAIN, SERVICE_RESET_RAIN):
        return

    async def _reset_rain(call: ServiceCall) -> None:
        entry = hass.config_entries.async_get_entry(call.data[ATTR_CONFIG_ENTRY_ID])
        if entry is None or entry.domain != DOMAIN or entry.state is not ConfigEntryState.LOADED:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="station_not_loaded"
            )
        await async_reset_rain(hass, entry)

    hass.services.async_register(
        DOMAIN,
        SERVICE_RESET_RAIN,
        _reset_rain,
        schema=vol.Schema({vol.Required(ATTR_CONFIG_ENTRY_ID): cv.string}),
    )


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded and not [
        other for other in hass.config_entries.async_entries(DOMAIN)
        if other.entry_id != entry.entry_id and other.state is ConfigEntryState.LOADED
    ]:
        _async_remove_panel(hass)
    return unloaded


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    store, store_data = await _async_store(hass)
    if store_data.pop(entry.entry_id, None) is not None:
        await store.async_save(store_data)
