"""Weather formulas, free of Home Assistant so they can be unit-tested."""

from __future__ import annotations

import math

# 16-point compass, clockwise from north; French uses O (ouest) for west.
CARDINALS = (
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
)
_CARDINAL_DEGREES = {name: index * 22.5 for index, name in enumerate(CARDINALS)}
_CARDINAL_DEGREES.update({
    name.replace("W", "O"): degrees
    for name, degrees in list(_CARDINAL_DEGREES.items())
    if "W" in name
})

_TO_CELSIUS = {
    "°C": lambda value: value,
    "°F": lambda value: (value - 32) * 5 / 9,
    "K": lambda value: value - 273.15,
}
_TO_METERS_PER_SECOND = {
    "m/s": 1.0,
    "km/h": 1 / 3.6,
    "mph": 0.44704,
    "kn": 0.514444,
    "ft/s": 0.3048,
    "Beaufort": None,
}


def parse_number(value) -> float | None:
    """A finite float, or None for unknown/unavailable/garbage states."""
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def parse_direction(value) -> float | None:
    """Wind direction in degrees [0, 360) from degrees or a compass point."""
    number = parse_number(value)
    if number is not None:
        return number % 360
    if isinstance(value, str):
        return _CARDINAL_DEGREES.get(value.strip().upper())
    return None


def to_celsius(value: float | None, unit: str | None) -> float | None:
    if value is None:
        return None
    convert = _TO_CELSIUS.get(unit or "°C")
    return convert(value) if convert else None


def to_meters_per_second(value: float | None, unit: str | None) -> float | None:
    if value is None:
        return None
    factor = _TO_METERS_PER_SECOND.get(unit or "km/h")
    return value * factor if factor else None


def dew_point(temperature: float, humidity: float) -> float | None:
    """Dew point (°C) with the Magnus formula; None for an invalid humidity."""
    if not 0 < humidity <= 100:
        return None
    a, b = 17.62, 243.12
    gamma = math.log(humidity / 100) + a * temperature / (b + temperature)
    return round(b * gamma / (a - gamma), 1)


def apparent_temperature(
    temperature: float, humidity: float, wind_speed: float | None = None
) -> float | None:
    """Feels-like temperature (°C), Australian Bureau of Meteorology formula.

    It accounts for humidity and wind (m/s, 0 without an anemometer).
    """
    if not 0 <= humidity <= 100:
        return None
    vapour_pressure = humidity / 100 * 6.105 * math.exp(17.27 * temperature / (237.7 + temperature))
    wind = max(wind_speed or 0.0, 0.0)
    return round(temperature + 0.33 * vapour_pressure - 0.70 * wind - 4.00, 1)
