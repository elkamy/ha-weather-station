"""Tests running inside a real Home Assistant (pytest-homeassistant-custom-component)."""

from unittest.mock import patch

import pytest

pytest_plugins = "pytest_homeassistant_custom_component"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Let Home Assistant load the integration from custom_components/."""
    yield


@pytest.fixture(autouse=True)
def without_web_server(request):
    """Skip serving the card: the flows and entities under test do not need it."""
    # The recorder must be set up before Home Assistant itself.
    if "recorder_mock" in request.fixturenames:
        request.getfixturevalue("recorder_mock")
    hass = request.getfixturevalue("hass")
    hass.config.components.update({"frontend", "http"})
    with patch("custom_components.weather_station.async_setup", return_value=True):
        yield
