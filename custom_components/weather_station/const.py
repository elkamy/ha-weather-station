DOMAIN = "weather_station"

CONF_STATION_NAME = "station_name"
CONF_RAIN_ENTITY = "rain_entity"
CONF_BATTERY_ENTITY = "battery_entity"
CONF_TEMPERATURE_ENTITY = "temperature_entity"
CONF_HUMIDITY_ENTITY = "humidity_entity"
CONF_PRESSURE_ENTITY = "pressure_entity"
CONF_WIND_SPEED_ENTITY = "wind_speed_entity"
CONF_WIND_GUST_ENTITY = "wind_gust_entity"
CONF_WIND_DIRECTION_ENTITY = "wind_direction_entity"
CONF_UV_ENTITY = "uv_index_entity"
CONF_ILLUMINANCE_ENTITY = "illuminance_entity"
CONF_SOLAR_RADIATION_ENTITY = "solar_radiation_entity"
CONF_IMPORT_HISTORY = "import_history"

# Optional sensors shown by the station, in display order: config key and the
# attribute published on the station sensor.
EXTRA_SENSORS = (
    (CONF_TEMPERATURE_ENTITY, "temperature"),
    (CONF_HUMIDITY_ENTITY, "humidity"),
    (CONF_PRESSURE_ENTITY, "pressure"),
    (CONF_WIND_SPEED_ENTITY, "wind_speed"),
    (CONF_WIND_GUST_ENTITY, "wind_gust"),
    (CONF_WIND_DIRECTION_ENTITY, "wind_direction"),
    (CONF_UV_ENTITY, "uv_index"),
    (CONF_ILLUMINANCE_ENTITY, "illuminance"),
    (CONF_SOLAR_RADIATION_ENTITY, "solar_radiation"),
)

CONF_MM_PER_TIP = "mm_per_tip"
CONF_DEBOUNCE_SECONDS = "debounce_seconds"
CONF_RAIN_WINDOW = "rain_window_minutes"

# Calibration measured on an Aqara door sensor rain gauge: 41 tips = 21.5 mm.
DEFAULT_MM_PER_TIP = 0.524
DEFAULT_DEBOUNCE_SECONDS = 0.0
DEFAULT_RAIN_WINDOW = 30
DEFAULT_IMPORT_HISTORY = True

UPDATE_INTERVAL_SECONDS = 60

# Sidebar panel showing the dashboard of every station.
PANEL_URL_PATH = "weather-station"
PANEL_ICON = "mdi:weather-partly-rainy"


def signal_updated(entry_id: str) -> str:
    return f"{DOMAIN}_updated_{entry_id}"
