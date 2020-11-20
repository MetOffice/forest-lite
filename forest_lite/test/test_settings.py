import pytest
import yaml
from fastapi.testclient import TestClient
from forest_lite.server import main, config


client = TestClient(main.app)


def get_settings(data):
    def wrapper():
        return config.Settings(**data)
    return wrapper


@pytest.mark.skip("auth module hard-coded")
def test_datasets_endpoint():

    # Prepare fake config
    data = {
        "datasets": [
            {"label": "Foo"},
            {"label": "Bar"}
        ]
    }

    # Patch main.get_settings
    main.app.dependency_overrides[config.get_settings] = get_settings(data)

    # GET /datasets endpoint
    response = client.get("/datasets")
    assert response.json() == {
        "datasets": [
            {"label": "Foo", "id": 0, "driver": "",
             "view": "tiled_image"},
            {"label": "Bar", "id": 1, "driver": "",
             "view": "tiled_image"},
        ]
    }
