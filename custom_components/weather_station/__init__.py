from __future__ import annotations

import asyncio
import logging
from datetime import timedelta
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback
import homeassistant.helpers.config_validation as cv
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
    DEFAULT_DEBOUNCE_SECONDS,
    DEFAULT_IMPORT_HISTORY,
    DEFAULT_MM_PER_TIP,
    DOMAIN,
    UPDATE_INTERVAL_SECONDS,
    signal_updated,
)
from .rain import RainGauge, is_tip, tips_from_history

_LOGGER = logging.getLogger(__name__)
PLATFORMS = ["sensor", "binary_sensor"]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

RAIN_STORE_KEY = f"{DOMAIN}.rain"
STORE_VERSION = 1
CARD_FILENAME = "weather-station-card.js"
CARD_URL = f"/{DOMAIN}/{CARD_FILENAME}"
# Bump when changing the card JavaScript to invalidate browser caches.
CARD_VERSION = "0.1.0"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Serve the Lovelace card and load it in every dashboard."""
    from homeassistant.components.frontend import add_extra_js_url
    from homeassistant.components.http import StaticPathConfig

    card = Path(__file__).parent / "www" / CARD_FILENAME
    await hass.http.async_register_static_paths([
        StaticPathConfig(CARD_URL, str(card), cache_headers=True),
    ])
    add_extra_js_url(hass, f"{CARD_URL}?v={CARD_VERSION}")
    hass.data.setdefault(DOMAIN, {})
    return True


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
    entry.runtime_data = {"rain": gauge}

    @callback
    def _save() -> None:
        store_data[entry.entry_id] = {**gauge.as_dict(), "entity": rain_entity}
        store.async_delay_save(lambda: store_data, 10)

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
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    store, store_data = await _async_store(hass)
    if store_data.pop(entry.entry_id, None) is not None:
        await store.async_save(store_data)
