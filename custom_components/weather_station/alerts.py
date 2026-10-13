"""Alert decisions, free of Home Assistant so they can be unit-tested.

An alert starts when a reading crosses its threshold and only ends once the
reading is clearly back on the safe side (hysteresis), so a value hovering
around the threshold does not start a new episode every few minutes.
"""

from __future__ import annotations

# The frost alert ends 1 °C above its threshold.
FROST_HYSTERESIS = 1.0
# The strong wind alert ends below 80 % of its threshold.
WIND_RELEASE_RATIO = 0.8

_TO_KMH = {"km/h": 1.0, "m/s": 3.6, "mph": 1.609344, "kn": 1.852, "ft/s": 1.09728}


def to_kmh(value: float | None, unit: str | None) -> float | None:
    if value is None:
        return None
    factor = _TO_KMH.get(unit or "km/h")
    return value * factor if factor else None


def frost_alert(active: bool | None, temperature: float | None, threshold: float) -> bool | None:
    """New state of the frost alert; None keeps the current one (no reading)."""
    if temperature is None:
        return None
    if active:
        return temperature <= threshold + FROST_HYSTERESIS
    return temperature <= threshold


def wind_alert(active: bool | None, wind_kmh: float | None, threshold_kmh: float) -> bool | None:
    """New state of the strong wind alert; None keeps the current one."""
    if wind_kmh is None:
        return None
    if active:
        return wind_kmh >= threshold_kmh * WIND_RELEASE_RATIO
    return wind_kmh >= threshold_kmh
