import pytest
from fastapi.testclient import TestClient
from forest_lite.server import main, config


client = TestClient(main.app)


def override(fn):
    main.app.dependency_overrides[config.get_settings] = fn


def get_settings(data):
    def fn():
        return config.Settings(**data)
    return fn


def test_viewport_endpoint_default():
    override(get_settings({}))
    response = client.get("/viewport")
    result = response.json()
    expect = {
        "longitude": [-180, 180],
        "latitude": [-85, 85]
    }
    assert result == expect


def test_viewport_endpoint_from_config():
    data = {
        "viewport": {
            "longitude": [10, 20],
            "latitude": [30, 40]
        }
    }

    # Patch main.get_settings
    override(get_settings(data))

    response = client.get("/viewport")
    result = response.json()
    expect = {
        "longitude": [10., 20.],
        "latitude": [30., 40.]
    }
    assert result == expect
