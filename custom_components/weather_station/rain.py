"""Tipping-bucket rain gauge, free of Home Assistant so it can be unit-tested.

Every change of the gauge's contact (on → off or off → on) is one tip of the
bucket. Counts are kept in tips, not millimetres, so changing the calibration
(mm per tip) applies to the whole history.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

PERIODS = ("day", "week", "month", "year")
# Tips are kept long enough for the rolling 24 h total and the hourly chart.
ROLLING_SECONDS = 25 * 3600
HOURLY_BUCKETS = 24
VALID_STATES = ("on", "off")
# The rate is averaged over the last tips of a shower, and a tip every few
# seconds is already a downpour (0.5 mm every 5 s = 360 mm/h).
RATE_TIPS = 5
MIN_TIP_INTERVAL = 5.0


def period_keys(moment: datetime) -> dict[str, str]:
    """Calendar periods containing a local time (weeks start on Monday)."""
    iso = moment.isocalendar()
    return {
        "day": moment.strftime("%Y-%m-%d"),
        "week": f"{iso[0]}-W{iso[1]:02d}",
        "month": moment.strftime("%Y-%m"),
        "year": moment.strftime("%Y"),
    }


def is_tip(old_state: str | None, new_state: str | None) -> bool:
    """A real contact change; availability changes and restarts are not tips."""
    return (
        old_state in VALID_STATES
        and new_state in VALID_STATES
        and old_state != new_state
    )


@dataclass
class RainGauge:
    mm_per_tip: float
    debounce_seconds: float = 0.0
    total_tips: int = 0
    # Per period: {"key": "2026-10-13", "tips": 12}
    periods: dict[str, dict] = field(default_factory=dict)
    # Timestamps (seconds) of the recent tips, oldest first.
    tips: list[float] = field(default_factory=list)
    last_tip: float | None = None

    def add_tip(self, moment: datetime) -> bool:
        """Record a tip at a local time; returns False when debounced."""
        timestamp = moment.timestamp()
        if (
            self.last_tip is not None
            and self.debounce_seconds > 0
            and 0 <= timestamp - self.last_tip < self.debounce_seconds
        ):
            return False
        self.total_tips += 1
        for period, key in period_keys(moment).items():
            current = self.periods.get(period)
            if current is None or current.get("key") != key:
                current = {"key": key, "tips": 0}
                self.periods[period] = current
            current["tips"] += 1
        self.tips.append(timestamp)
        self.tips.sort()
        if self.last_tip is None or timestamp > self.last_tip:
            self.last_tip = timestamp
        self.prune(moment)
        return True

    def reset(self) -> None:
        """Forget every tip: all totals start again from zero."""
        self.total_tips = 0
        self.periods = {}
        self.tips = []
        self.last_tip = None

    def prune(self, now: datetime) -> None:
        limit = now.timestamp() - ROLLING_SECONDS
        self.tips = [tip for tip in self.tips if tip >= limit]

    def _mm(self, tips: int) -> float:
        return round(tips * self.mm_per_tip, 2)

    def period_amount(self, period: str, now: datetime) -> float:
        """Rain of the current day/week/month/year; 0 once the period is over."""
        current = self.periods.get(period)
        if not current or current.get("key") != period_keys(now)[period]:
            return 0.0
        return self._mm(current.get("tips", 0))

    @property
    def total(self) -> float:
        return self._mm(self.total_tips)

    def rolling_amount(self, seconds: float, now: datetime) -> float:
        """Rain over the last `seconds`."""
        limit = now.timestamp() - seconds
        return self._mm(sum(1 for tip in self.tips if tip > limit))

    def is_raining(self, now: datetime, window_minutes: float) -> bool:
        return (
            self.last_tip is not None
            and now.timestamp() - self.last_tip <= window_minutes * 60
        )

    def rate(self, now: datetime, window_minutes: float) -> float:
        """Rain intensity in mm/h, from the interval between the last tips.

        The interval grows with the time since the last tip, so the rate fades
        out as the rain stops, and drops to 0 after the rain window.
        """
        if not self.is_raining(now, window_minutes):
            return 0.0
        # Tips of the current shower: no gap longer than the rain window.
        shower = [self.last_tip]
        for tip in reversed([tip for tip in self.tips if tip < self.last_tip]):
            if shower[0] - tip > window_minutes * 60 or len(shower) >= RATE_TIPS:
                break
            shower.insert(0, tip)
        if len(shower) < 2:
            # First tip of a shower: the bucket may have filled for a long
            # time, so only the rain of the last hour is known.
            return round(self.rolling_amount(3600, now), 1)
        # Averaged over several tips so that a contact bounce is no downpour.
        interval = max(
            (shower[-1] - shower[0]) / (len(shower) - 1),
            now.timestamp() - self.last_tip,
            MIN_TIP_INTERVAL,
        )
        return round(self.mm_per_tip * 3600 / interval, 1)

    def hourly(self, now: datetime) -> list[float]:
        """Rain per hour over the last 24 hours, the current hour last."""
        current_hour = now.replace(minute=0, second=0, microsecond=0).timestamp()
        first = current_hour - (HOURLY_BUCKETS - 1) * 3600
        counts = [0] * HOURLY_BUCKETS
        for tip in self.tips:
            if tip >= first:
                counts[min(int((tip - first) // 3600), HOURLY_BUCKETS - 1)] += 1
        return [self._mm(count) for count in counts]

    def as_dict(self) -> dict:
        return {
            "total_tips": self.total_tips,
            "periods": self.periods,
            "tips": self.tips,
            "last_tip": self.last_tip,
        }

    @classmethod
    def from_dict(
        cls, data: dict | None, mm_per_tip: float, debounce_seconds: float = 0.0
    ) -> RainGauge:
        gauge = cls(mm_per_tip=mm_per_tip, debounce_seconds=debounce_seconds)
        if not data:
            return gauge
        try:
            gauge.total_tips = max(int(data.get("total_tips", 0)), 0)
            gauge.periods = {
                period: {"key": str(value["key"]), "tips": max(int(value["tips"]), 0)}
                for period, value in (data.get("periods") or {}).items()
                if period in PERIODS
            }
            gauge.tips = sorted(float(tip) for tip in data.get("tips") or [])
            last = data.get("last_tip")
            gauge.last_tip = float(last) if last is not None else None
        except (TypeError, ValueError, KeyError):
            return cls(mm_per_tip=mm_per_tip, debounce_seconds=debounce_seconds)
        return gauge


def tips_from_history(changes: list[tuple[str, datetime]]) -> list[datetime]:
    """Tip times found in a sensor's recorded states, oldest first.

    Unavailable states break the sequence: the change that follows them is not
    a tip, as for live updates.
    """
    tips = []
    previous = None
    for state, moment in sorted(changes, key=lambda change: change[1]):
        if is_tip(previous, state):
            tips.append(moment)
        previous = state
    return tips
