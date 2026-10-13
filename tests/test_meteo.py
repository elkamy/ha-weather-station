"""Tests of the weather formulas (no Home Assistant needed)."""

import importlib.util
import sys
import unittest
from pathlib import Path

_PATH = Path(__file__).resolve().parents[1] / "custom_components" / "weather_station" / "meteo.py"
_SPEC = importlib.util.spec_from_file_location("weather_station_meteo", _PATH)
meteo = importlib.util.module_from_spec(_SPEC)
sys.modules[_SPEC.name] = meteo
_SPEC.loader.exec_module(meteo)


class DirectionTests(unittest.TestCase):
    def test_degrees(self):
        self.assertEqual(meteo.parse_direction("270"), 270)
        self.assertEqual(meteo.parse_direction(370), 10)
        self.assertEqual(meteo.parse_direction("-90"), 270)

    def test_compass_points_in_english_and_french(self):
        self.assertEqual(meteo.parse_direction("NW"), 315)
        self.assertEqual(meteo.parse_direction("no"), 315)
        self.assertEqual(meteo.parse_direction("SSO"), 202.5)
        self.assertEqual(meteo.parse_direction(" e "), 90)

    def test_invalid(self):
        for value in (None, "unknown", "unavailable", "nan", ""):
            self.assertIsNone(meteo.parse_direction(value), value)


class ConversionTests(unittest.TestCase):
    def test_temperature(self):
        self.assertAlmostEqual(meteo.to_celsius(50, "°F"), 10)
        self.assertEqual(meteo.to_celsius(12, None), 12)
        self.assertIsNone(meteo.to_celsius(12, "bananas"))

    def test_wind(self):
        self.assertAlmostEqual(meteo.to_meters_per_second(36, "km/h"), 10)
        self.assertAlmostEqual(meteo.to_meters_per_second(10, "m/s"), 10)
        self.assertIsNone(meteo.to_meters_per_second(None, "km/h"))


class ComfortTests(unittest.TestCase):
    def test_dew_point(self):
        # Reference values: 20 °C at 50 % -> 9.3 °C, saturated air -> air temperature.
        self.assertEqual(meteo.dew_point(20, 50), 9.3)
        self.assertEqual(meteo.dew_point(15, 100), 15.0)
        self.assertIsNone(meteo.dew_point(15, 0))

    def test_apparent_temperature(self):
        self.assertEqual(meteo.apparent_temperature(20, 50), 19.8)
        # Wind makes it feel colder.
        self.assertLess(meteo.apparent_temperature(5, 80, 8), meteo.apparent_temperature(5, 80, 0))
        self.assertIsNone(meteo.apparent_temperature(20, 120))


if __name__ == "__main__":
    unittest.main()


class ConditionTests(unittest.TestCase):
    def test_clear_sky_irradiance(self):
        self.assertEqual(meteo.clear_sky_irradiance(-5), 0.0)
        # Sun at the zenith: about 1037 W/m².
        self.assertAlmostEqual(meteo.clear_sky_irradiance(90), 1037.2, places=1)

    def test_sky_condition(self):
        clear = meteo.clear_sky_irradiance(40)
        self.assertEqual(meteo.sky_condition(clear * 0.9, 40), "sunny")
        self.assertEqual(meteo.sky_condition(clear * 0.5, 40), "partlycloudy")
        self.assertEqual(meteo.sky_condition(clear * 0.1, 40), "cloudy")
        # Sun too low, or nothing measured.
        self.assertIsNone(meteo.sky_condition(50, 5))
        self.assertIsNone(meteo.sky_condition(None, 40))
        self.assertIsNone(meteo.sky_condition(500, None))

    def test_station_condition_priorities(self):
        self.assertEqual(meteo.station_condition(True, 2, True, "sunny", "sunny"), "rainy")
        self.assertEqual(meteo.station_condition(True, 12, False, None, None), "pouring")
        self.assertEqual(meteo.station_condition(False, 0, True, "sunny", None), "windy")
        self.assertEqual(meteo.station_condition(False, 0, False, "partlycloudy", "rainy"), "partlycloudy")
        self.assertEqual(meteo.station_condition(False, 0, False, None, "clear-night"), "clear-night")
        self.assertIsNone(meteo.station_condition(False, 0, False, None, None))
        self.assertIsNone(meteo.station_condition(False, 0, False, None, "unavailable"))

    def test_forecast_rain_without_rain_at_the_station(self):
        self.assertEqual(meteo.station_condition(False, 0, False, None, "rainy"), "cloudy")
        self.assertEqual(meteo.station_condition(False, 0, False, None, "lightning-rainy"), "lightning")
