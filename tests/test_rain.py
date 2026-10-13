"""Tests of the rain gauge logic (no Home Assistant needed)."""

import importlib.util
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

_PATH = Path(__file__).resolve().parents[1] / "custom_components" / "weather_station" / "rain.py"
_SPEC = importlib.util.spec_from_file_location("weather_station_rain", _PATH)
rain = importlib.util.module_from_spec(_SPEC)
sys.modules[_SPEC.name] = rain
_SPEC.loader.exec_module(rain)

TZ = timezone(timedelta(hours=2))
MM = 0.524


def at(day=13, hour=10, minute=0, second=0, month=10):
    return datetime(2026, month, day, hour, minute, second, tzinfo=TZ)


class IsTipTests(unittest.TestCase):
    def test_contact_changes_are_tips(self):
        self.assertTrue(rain.is_tip("on", "off"))
        self.assertTrue(rain.is_tip("off", "on"))

    def test_availability_changes_are_not_tips(self):
        for old, new in (("unavailable", "on"), ("on", "unavailable"), (None, "on"), ("unknown", "off"), ("on", "on")):
            self.assertFalse(rain.is_tip(old, new), (old, new))


class PeriodKeysTests(unittest.TestCase):
    def test_weeks_start_on_monday(self):
        self.assertEqual(rain.period_keys(at(day=11))["week"], "2026-W41")  # Sunday
        self.assertEqual(rain.period_keys(at(day=12))["week"], "2026-W42")  # Monday

    def test_keys(self):
        self.assertEqual(
            rain.period_keys(at()),
            {"day": "2026-10-13", "week": "2026-W42", "month": "2026-10", "year": "2026"},
        )


class RainGaugeTests(unittest.TestCase):
    def test_41_tips_make_the_measured_21_5_mm(self):
        gauge = rain.RainGauge(MM)
        for index in range(41):
            gauge.add_tip(at(minute=index))
        self.assertAlmostEqual(gauge.period_amount("day", at(minute=50)), 21.48)
        self.assertAlmostEqual(gauge.total, 21.48)

    def test_periods_reset(self):
        gauge = rain.RainGauge(1.0)
        gauge.add_tip(at(day=12))
        gauge.add_tip(at(day=13))
        now = at(day=13, hour=12)
        self.assertEqual(gauge.period_amount("day", now), 1.0)
        self.assertEqual(gauge.period_amount("week", now), 2.0)
        # The day is over: nothing until the next tip.
        self.assertEqual(gauge.period_amount("day", at(day=14)), 0.0)
        self.assertEqual(gauge.period_amount("month", at(day=1, month=11)), 0.0)
        self.assertEqual(gauge.total, 2.0)

    def test_calibration_applies_to_history(self):
        gauge = rain.RainGauge(0.5)
        gauge.add_tip(at())
        gauge.add_tip(at(minute=1))
        restored = rain.RainGauge.from_dict(gauge.as_dict(), mm_per_tip=0.3)
        self.assertAlmostEqual(restored.period_amount("day", at(minute=2)), 0.6)

    def test_debounce(self):
        gauge = rain.RainGauge(1.0, debounce_seconds=2)
        self.assertTrue(gauge.add_tip(at()))
        self.assertFalse(gauge.add_tip(at(second=1)))
        self.assertTrue(gauge.add_tip(at(second=3)))
        self.assertEqual(gauge.total_tips, 2)

    def test_no_debounce_counts_everything(self):
        gauge = rain.RainGauge(1.0)
        gauge.add_tip(at())
        self.assertTrue(gauge.add_tip(at()))

    def test_rolling_amounts_and_pruning(self):
        gauge = rain.RainGauge(1.0)
        gauge.add_tip(at(day=12, hour=8))   # older than 24 h at day 13, 10:00
        gauge.add_tip(at(hour=8))
        gauge.add_tip(at(hour=9, minute=30))
        now = at(hour=10)
        self.assertEqual(gauge.rolling_amount(3600, now), 1.0)
        self.assertEqual(gauge.rolling_amount(86400, now), 2.0)
        gauge.prune(at(day=14, hour=12))
        self.assertEqual(gauge.tips, [])

    def test_raining_window(self):
        gauge = rain.RainGauge(1.0)
        self.assertFalse(gauge.is_raining(at(), 30))
        gauge.add_tip(at())
        self.assertTrue(gauge.is_raining(at(minute=30), 30))
        self.assertFalse(gauge.is_raining(at(minute=31), 30))

    def test_rate_from_interval_between_tips(self):
        gauge = rain.RainGauge(0.5)
        gauge.add_tip(at())
        gauge.add_tip(at(minute=1))
        # 0.5 mm per minute = 30 mm/h
        self.assertEqual(gauge.rate(at(minute=1, second=10), 30), 30.0)
        # Fades out while no tip comes.
        self.assertEqual(gauge.rate(at(minute=11), 30), 3.0)
        self.assertEqual(gauge.rate(at(minute=40), 30), 0.0)

    def test_rate_is_not_fooled_by_a_bounce(self):
        gauge = rain.RainGauge(0.5)
        for minute in range(4):
            gauge.add_tip(at(minute=minute))
        gauge.add_tip(at(minute=3) + timedelta(seconds=0.3))
        # 5 tips over 3 min 0.3 s, not one tip in 0.3 s (6000 mm/h).
        self.assertEqual(gauge.rate(at(minute=3, second=1), 30), 39.9)

    def test_rate_of_first_tip(self):
        gauge = rain.RainGauge(0.5)
        gauge.add_tip(at(hour=6))
        gauge.add_tip(at())
        self.assertEqual(gauge.rate(at(second=20), 30), 0.5)

    def test_hourly(self):
        gauge = rain.RainGauge(1.0)
        gauge.add_tip(at(hour=10, minute=5))
        gauge.add_tip(at(hour=9, minute=59))
        gauge.add_tip(at(hour=11, minute=0))  # after now: counted in the current hour
        hourly = gauge.hourly(at(hour=10, minute=30))
        self.assertEqual(len(hourly), 24)
        self.assertEqual(hourly[-1], 2.0)
        self.assertEqual(hourly[-2], 1.0)
        self.assertEqual(sum(hourly), 3.0)

    def test_restore_ignores_corrupt_data(self):
        gauge = rain.RainGauge.from_dict({"total_tips": "x"}, mm_per_tip=1.0)
        self.assertEqual(gauge.total_tips, 0)
        gauge = rain.RainGauge.from_dict({"periods": {"day": {"key": "2026-10-13", "tips": 3}, "bad": {}}}, 1.0)
        self.assertEqual(list(gauge.periods), ["day"])


class HistoryTests(unittest.TestCase):
    def test_tips_from_history(self):
        changes = [
            ("on", at(minute=0)),
            ("off", at(minute=1)),
            ("unavailable", at(minute=2)),
            ("off", at(minute=3)),   # back after unavailable: not a tip
            ("on", at(minute=4)),
        ]
        self.assertEqual(rain.tips_from_history(list(reversed(changes))), [at(minute=1), at(minute=4)])


if __name__ == "__main__":
    unittest.main()
