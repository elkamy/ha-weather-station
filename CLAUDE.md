# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Home Assistant custom integration (HACS) `weather_station`: one config entry per weather station, built around a tipping-bucket rain gauge read through a contact `binary_sensor` (Aqara door sensor via Zigbee2MQTT on the author's instance), with optional temperature / humidity / pressure / wind / battery sensors. It ships one Lovelace card. User-facing text (README, CHANGELOG, translations, card UI) is written in French — keep it that way.

## Commands

```bash
python -m compileall -q custom_components/weather_station tests tests_ha
python -m unittest discover -s tests -v                       # pure rain logic, no dependency
node --check custom_components/weather_station/www/weather-station-card.js
node --test tests/test_card.js
python -m pytest                                              # tests_ha/: real Home Assistant
```

`tests_ha/` needs `pip install pytest-homeassistant-custom-component`; prefer it for anything touching flows, entities or HA APIs.

## Architecture

- **`rain.py`** (pure, HA-free): `RainGauge` counts tips (not mm) per calendar period (`period_keys`: day, ISO week, month, year), in total, and keeps the timestamps of the last 25 h for rolling totals, rate and the 24 hourly buckets. Changing `mm_per_tip` therefore recalibrates the whole history. `is_tip` only accepts `on`↔`off` changes, so restarts and `unavailable` never count; `tips_from_history` applies the same rule to recorder states. Put decision logic here.
- **`__init__.py`**: serves the card at `/weather_station/weather-station-card.js` (`CARD_VERSION` is the cache-buster, bump it when the card changes). `async_setup_entry` restores the gauge from the `weather_station.rain` store (dropped when the rain entity changed), optionally imports the recorder history once, listens to the rain entity, and fires `signal_updated(entry_id)` on every tip and every minute (rolling totals, rate and period resets depend on time). Options changes reload the entry.
- **`sensor.py`**: one `RainSensor` per `RAIN_SENSORS` description. `StationSensor` (today's rain) also publishes every reading in its attributes — `weather_station: true`, `station_name`, `rain_*`, `raining`, `hourly_rain`, `battery`, `<extra>` + `<extra>_unit` — which is **the contract consumed by the card**. Most are in `_unrecorded_attributes`. Changing attribute names requires updating the card and its tests.
- **`binary_sensor.py`**: `RainingSensor`, on while the last tip is within `rain_window_minutes`.
- **`config_flow.py`**: `user` (name, rain entity = unique ID, mm per tip, import history) → `sensors` (optional sensors, battery suggested from the rain gauge's device). `reconfigure` changes sensors. Options: `mm_per_tip`, `debounce_seconds`, `rain_window_minutes`. `entry.data` holds entities; `entry.options` holds the rain gauge settings.
- **Card** (`www/weather-station-card.js`): vanilla custom element, no build step, texts from `WEATHER_STATION_TEXT` (`fr`/`en`, picked from `hass.locale.language`); never hardcode user-facing text outside it. Finds stations by `attributes.weather_station === true`.

## Conventions

- `www/` at the repo root holds an **identical copy** of the card for manual installation; keep it in sync.
- When the version changes, update `manifest.json` `version`, `CARD_VERSION` in `__init__.py` and `CHANGELOG.md` (French, "Non publié" section for unreleased changes).
- Adding a new kind of sensor to the station: add its config key to `EXTRA_SENSORS` (const), `SENSOR_FIELDS` (config flow), the translations, and `WEATHER_STATION_EXTRAS` in the card.
- `docs/brand/weather-station-icon.svg` is the single source of the emblem (HACS requires brand assets). `custom_components/weather_station/brand/icon.svg` is a copy, `icon.png` and `icon@2x.png` are rendered from it (headless Chrome, 256 and 512 px, transparent background): regenerate all three when it changes.
