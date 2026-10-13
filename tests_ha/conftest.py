"""Tests running inside a real Home Assistant (pytest-homeassistant-custom-component)."""

from unittest.mock import AsyncMock, patch

import pytest

pytest_plugins = "pytest_homeassistant_custom_component"


@pytest.fixture
def register_panel():
    """The sidebar panel registration, replaced by a mock."""
    return AsyncMock()


@pytest.fixture(autouse=True)
def custom_integration_without_web_server(request, register_panel):
    """Load the integration from custom_components/, without serving the cards.

    The flows and entities under test do not need the cards or a real panel.
    Fixtures are requested here, in order, because the recorder must be set up
    before Home Assistant itself.
    """
    if "recorder_mock" in request.fixturenames:
        request.getfixturevalue("recorder_mock")
    request.getfixturevalue("enable_custom_integrations")
    hass = request.getfixturevalue("hass")
    hass.config.components.update({"frontend", "http", "panel_custom"})
    with (
        patch("custom_components.weather_station.async_setup", return_value=True),
        patch("homeassistant.components.panel_custom.async_register_panel", register_panel),
        patch("homeassistant.components.frontend.async_remove_panel") as remove_panel,
    ):
        register_panel.remove = remove_panel
        yield
