# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Home Assistant custom integration (HACS) `weather_station`: one config entry per weather station, built around a tipping-bucket rain gauge read through a contact `binary_sensor` (Aqara door sensor via Zigbee2MQTT on the author's instance), with optional temperature / humidity / pressure / wind speed, gust and direction / UV / illuminance / solar radiation / battery sensors. It ships a compact card, a dashboard card and a sidebar panel showing the dashboard. User-facing text (README, CHANGELOG, translations, card UI) is written in French — keep it that way.

## Commands

```bash
python -m compileall -q custom_components/weather_station tests tests_ha
python -m unittest discover -s tests -v                       # pure rain logic, no dependency
node --check custom_components/weather_station/www/weather-station-card.js
node --check custom_components/weather_station/www/weather-station-dashboard.js
node --test tests/test_card.js tests/test_dashboard.js
python -m pytest                                              # tests_ha/: real Home Assistant
```

`tests_ha/` needs `pip install pytest-homeassistant-custom-component`; prefer it for anything touching flows, entities or HA APIs.

## Architecture

- **`rain.py`** (pure, HA-free): `RainGauge` counts tips (not mm) per calendar period (`period_keys`: day, ISO week, month, year), in total, and keeps the timestamps of the last 25 h for rolling totals, rate and the 24 hourly buckets. Changing `mm_per_tip` therefore recalibrates the whole history. `is_tip` only accepts `on`↔`off` changes, so restarts and `unavailable` never count; `tips_from_history` applies the same rule to recorder states. Put decision logic here.
- **`__init__.py`**: serves `CARD_FILES` under `/weather_station/` (`CARD_VERSION` is the cache-buster, bump it when a card changes) and registers the `weather-station` sidebar panel (`panel_custom`, web component `weather-station-panel`) with the first loaded station, removed with the last one. `async_setup_entry` restores the gauge from the `weather_station.rain` store (dropped when the rain entity changed), optionally imports the recorder history once, listens to the rain entity, and fires `signal_updated(entry_id)` on every tip and every minute (rolling totals, rate and period resets depend on time). Options changes reload the entry.
- **`sensor.py`**: one `RainSensor` per `RAIN_SENSORS` description. `StationSensor` (today's rain) also publishes every reading in its attributes — `weather_station: true`, `station_name`, `rain_*`, `raining`, `hourly_rain`, `battery`, `<extra>` + `<extra>_unit`, `wind_direction` in degrees, `entities` (kind → entity ID, including `rain_total`, `dew_point`, `feels_like`) — which is **the contract consumed by the cards**. Most are in `_unrecorded_attributes`. Changing attribute names requires updating the card and its tests.
- **`weather.py`** (pure): unit conversions, `parse_direction` (degrees or compass points, French O for W), `dew_point` (Magnus) and `apparent_temperature` (BoM formula, wind in m/s). `sensor.py` builds the `dew_point` / `feels_like` `ComfortSensor`s from them when temperature and humidity are set.
- **`binary_sensor.py`**: `RainingSensor`, on while the last tip is within `rain_window_minutes`.
- **`config_flow.py`**: `user` (name, rain entity = unique ID, mm per tip, import history) → `sensors` (optional sensors, battery suggested from the rain gauge's device). `reconfigure` changes sensors. Options: `mm_per_tip`, `debounce_seconds`, `rain_window_minutes`. `entry.data` holds entities; `entry.options` holds the rain gauge settings.
- **Dashboard** (`www/weather-station-dashboard.js`): `weather-station-dashboard-card` and `weather-station-panel` (toolbar, one tab per station, the card inside). Data: 24 h raw history (`history/history_during_period`, seconds) for tiles and 24 h charts; long-term statistics (`recorder/statistics_during_period`, milliseconds; hour for 7 d, day for 30 d) otherwise; rain bars from the station's `hourly_rain` (24 h) or `change` statistics of `rain_total`, today/current month taken from the station. Sections are replaced one by one (`data-part`) so a chart being hovered survives sensor updates. Chart colours follow the dataviz palette (`--ws-s1..3`, light/dark from `hass.themes.darkMode`), slot 3 is dashed; one axis per chart. Pure helpers are top-level `wsd*` functions, tested through the vm context.
- **Compact card** (`www/weather-station-card.js`): vanilla custom element, no build step, texts from `WEATHER_STATION_TEXT` (`fr`/`en`, picked from `hass.locale.language`); never hardcode user-facing text outside it. Finds stations by `attributes.weather_station === true`.

## Conventions

- `www/` at the repo root holds **identical copies** of the card files for manual installation; keep it in sync.
- When the version changes, update `manifest.json` `version`, `CARD_VERSION` in `__init__.py` and `CHANGELOG.md` (French, "Non publié" section for unreleased changes).
- Adding a new kind of sensor to the station: add its config key to `EXTRA_SENSORS` (const), `SENSOR_FIELDS` (config flow), the translations, `WEATHER_STATION_EXTRAS` in the compact card, and `WSD_DIGITS` / `WSD_LINE_CHARTS` / the tiles in the dashboard.
- `docs/brand/weather-station-icon.svg` is the single source of the emblem (HACS requires brand assets). `custom_components/weather_station/brand/icon.svg` is a copy, `icon.png` and `icon@2x.png` are rendered from it (headless Chrome, 256 and 512 px, transparent background): regenerate all three when it changes.
