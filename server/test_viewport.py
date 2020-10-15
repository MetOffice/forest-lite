import pytest
import yaml
from fastapi.testclient import TestClient
import main, config


client = TestClient(main.app)


def get_settings(config_file):
    def fn():
        return config.Settings(config_file=config_file)
    return fn


def test_viewport_endpoint_default():
    response = client.get("/viewport")
    result = response.json()
    expect = {
        "longitude": [-180, 180],
        "latitude": [-85, 85]
    }
    assert result == expect


def test_viewport_endpoint_from_config(tmpdir):
    data = {
        "viewport": {
            "longitude": [10, 20],
            "latitude": [30, 40]
        }
    }
    config_file = str(tmpdir / "config.yaml")
    with open(config_file, "w") as stream:
        yaml.dump(data, stream)

    # Patch main.get_settings
    main.app.dependency_overrides[config.get_settings] = get_settings(config_file)

    response = client.get("/viewport")
    result = response.json()
    expect = {
        "longitude": [10., 20.],
        "latitude": [30., 40.]
    }
    assert result == expect
