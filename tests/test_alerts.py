"""Tests of the alert decisions (no Home Assistant needed)."""

import importlib.util
import sys
import unittest
from pathlib import Path

_PATH = Path(__file__).resolve().parents[1] / "custom_components" / "weather_station" / "alerts.py"
_SPEC = importlib.util.spec_from_file_location("weather_station_alerts", _PATH)
alerts = importlib.util.module_from_spec(_SPEC)
sys.modules[_SPEC.name] = alerts
_SPEC.loader.exec_module(alerts)


class FrostTests(unittest.TestCase):
    def test_starts_at_the_threshold(self):
        self.assertFalse(alerts.frost_alert(False, 2.1, 2))
        self.assertTrue(alerts.frost_alert(False, 2.0, 2))

    def test_ends_one_degree_above(self):
        self.assertTrue(alerts.frost_alert(True, 2.9, 2))
        self.assertTrue(alerts.frost_alert(True, 3.0, 2))
        self.assertFalse(alerts.frost_alert(True, 3.1, 2))

    def test_unknown_reading_keeps_the_state(self):
        self.assertIsNone(alerts.frost_alert(True, None, 2))

    def test_first_evaluation(self):
        self.assertTrue(alerts.frost_alert(None, -1, 2))


class WindTests(unittest.TestCase):
    def test_hysteresis(self):
        self.assertFalse(alerts.wind_alert(False, 49, 50))
        self.assertTrue(alerts.wind_alert(False, 50, 50))
        self.assertTrue(alerts.wind_alert(True, 40, 50))
        self.assertFalse(alerts.wind_alert(True, 39.9, 50))
        self.assertIsNone(alerts.wind_alert(False, None, 50))

    def test_units(self):
        self.assertAlmostEqual(alerts.to_kmh(10, "m/s"), 36)
        self.assertAlmostEqual(alerts.to_kmh(10, "kn"), 18.52)
        self.assertEqual(alerts.to_kmh(30, None), 30)
        self.assertIsNone(alerts.to_kmh(30, "Beaufort"))


if __name__ == "__main__":
    unittest.main()
