"""Tests running inside a real Home Assistant (pytest-homeassistant-custom-component)."""

from unittest.mock import patch

import pytest

pytest_plugins = "pytest_homeassistant_custom_component"


@pytest.fixture(autouse=True)
def custom_integration_without_web_server(request):
    """Load the integration from custom_components/, without serving the card.

    The flows and entities under test do not need the card. Fixtures are
    requested here, in order, because the recorder must be set up before Home
    Assistant itself.
    """
    if "recorder_mock" in request.fixturenames:
        request.getfixturevalue("recorder_mock")
    request.getfixturevalue("enable_custom_integrations")
    hass = request.getfixturevalue("hass")
    hass.config.components.update({"frontend", "http"})
    with patch("custom_components.weather_station.async_setup", return_value=True):
        yield
