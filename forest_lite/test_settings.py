import yaml
from fastapi.testclient import TestClient
import main, config


client = TestClient(main.app)


def get_settings(config_file):
    def wrapper():
        return config.Settings(config_file=config_file)
    return wrapper


def test_datasets_endpoint(tmpdir):

    # Prepare fake config.yaml
    path = str(tmpdir / "test-conf.yaml")
    data = {
        "datasets": [
            {"label": "Foo"},
            {"label": "Bar"}
        ]
    }
    with open(path, "w") as stream:
        yaml.dump(data, stream)

    # Patch main.get_settings
    main.app.dependency_overrides[main.get_settings] = get_settings(path)

    # GET /datasets endpoint
    response = client.get("/datasets")
    assert response.json() == {
        "datasets": [
            {"label": "Foo", "id": 0, "driver": ""},
            {"label": "Bar", "id": 1, "driver": ""},
        ]
    }
