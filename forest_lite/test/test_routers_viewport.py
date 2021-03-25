from fastapi.testclient import TestClient
from forest_lite.server import main, config
from forest_lite.server.lib.config import Config
import pytest


client = TestClient(main.app)


def use_settings(props):
    """Override get_settings runtime dependency"""
    settings = Config(**props)
    main.app.dependency_overrides[config.get_settings] = lambda: settings


def test_get_viewport():
    """HTTP GET endpoint to set map boundaries"""
    # Fake config
    use_settings({
        "datasets": []
    })

    # System under test
    response = client.get("/api")
    url = response.json()["links"]["viewport"]
    response = client.get(url)
    actual = response.json()

    # Assertions
    expected = {
        "longitude": [-180, 180],
        "latitude": [-85, 85]
    }
    assert expected == actual
