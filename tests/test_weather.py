"""Tests of the weather formulas (no Home Assistant needed)."""

import importlib.util
import sys
import unittest
from pathlib import Path

_PATH = Path(__file__).resolve().parents[1] / "custom_components" / "weather_station" / "weather.py"
_SPEC = importlib.util.spec_from_file_location("weather_station_weather", _PATH)
weather = importlib.util.module_from_spec(_SPEC)
sys.modules[_SPEC.name] = weather
_SPEC.loader.exec_module(weather)


class DirectionTests(unittest.TestCase):
    def test_degrees(self):
        self.assertEqual(weather.parse_direction("270"), 270)
        self.assertEqual(weather.parse_direction(370), 10)
        self.assertEqual(weather.parse_direction("-90"), 270)

    def test_compass_points_in_english_and_french(self):
        self.assertEqual(weather.parse_direction("NW"), 315)
        self.assertEqual(weather.parse_direction("no"), 315)
        self.assertEqual(weather.parse_direction("SSO"), 202.5)
        self.assertEqual(weather.parse_direction(" e "), 90)

    def test_invalid(self):
        for value in (None, "unknown", "unavailable", "nan", ""):
            self.assertIsNone(weather.parse_direction(value), value)


class ConversionTests(unittest.TestCase):
    def test_temperature(self):
        self.assertAlmostEqual(weather.to_celsius(50, "°F"), 10)
        self.assertEqual(weather.to_celsius(12, None), 12)
        self.assertIsNone(weather.to_celsius(12, "bananas"))

    def test_wind(self):
        self.assertAlmostEqual(weather.to_meters_per_second(36, "km/h"), 10)
        self.assertAlmostEqual(weather.to_meters_per_second(10, "m/s"), 10)
        self.assertIsNone(weather.to_meters_per_second(None, "km/h"))


class ComfortTests(unittest.TestCase):
    def test_dew_point(self):
        # Reference values: 20 °C at 50 % -> 9.3 °C, saturated air -> air temperature.
        self.assertEqual(weather.dew_point(20, 50), 9.3)
        self.assertEqual(weather.dew_point(15, 100), 15.0)
        self.assertIsNone(weather.dew_point(15, 0))

    def test_apparent_temperature(self):
        self.assertEqual(weather.apparent_temperature(20, 50), 19.8)
        # Wind makes it feel colder.
        self.assertLess(weather.apparent_temperature(5, 80, 8), weather.apparent_temperature(5, 80, 0))
        self.assertIsNone(weather.apparent_temperature(20, 120))


if __name__ == "__main__":
    unittest.main()
