import pytest
from fastapi.testclient import TestClient
import main, config


client = TestClient(main.app)


def get_settings(config_file):
    def fn():
        return config.Settings(config_file=config_file)
    return fn


def test_viewport_endpoint():
    response = client.get("/viewport")
    result = response.json()
    expect = {
        "lons": [-180, 180],
        "lats": [-85, 85]
    }
    assert result == expect
