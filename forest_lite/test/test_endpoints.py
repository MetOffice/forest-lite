import pytest
from fastapi.testclient import TestClient
import h5netcdf
from forest_lite.server import main, config
from forest_lite.test.helpers import sample_h5netcdf


client = TestClient(main.app)


def sample_config(netcdf_path):
    return {
        "datasets": [
            {
                "label": "dataset-0",
                "driver": {
                    "name": "eida50",
                    "settings": {
                        "pattern": netcdf_path
                    }
                }
            }
        ]
    }


def test_tile_endpoint(tmpdir):
    netcdf_path = str(tmpdir / "test-netcdf.nc")

    # Config file
    data = sample_config(netcdf_path)

    # NetCDF file
    sample_h5netcdf(netcdf_path)

    # System under test
    settings = config.Settings(**data)
    main.app.dependency_overrides[config.get_settings] = lambda: settings
    response = client.get("/datasets/0/data/times/0/tiles/0/0/0")
    actual = response.json()

    # Assert response
    assert actual["tile"] == [0, 0, 0]
    assert actual["data"]["x"] == [-20037508.342789244]
    assert actual["data"]["y"] == [-20037508.342789255]
    assert actual["data"]["dw"] == [40075016.68557849]
    assert actual["data"]["dh"] == [40075016.685578495]
    # assert np.shape(actual["data"]["image"][0]) == (64, 64)


def override_get_settings(data):
    settings = config.Settings(**data)
    main.app.dependency_overrides[config.get_settings] = lambda: settings


def test_dataset_data_vars(tmpdir):

    # NetCDF file
    netcdf_path = str(tmpdir / "test-file.nc")
    data_vars = ["geopotential_height", "air_temperature"]
    sample_h5netcdf(netcdf_path, data_vars)

    # Configure application
    data = {
        "datasets": [
            {
                "label": "Label",
                "driver": {
                    "name": "eida50",
                    "settings": {
                        "pattern": netcdf_path,
                        "data_vars": ["air_temperature"]
                    }
                },
            }
        ]
    }

    # Configure client
    override_get_settings(data)

    response = client.get("/datasets/0").json()
    actual = list(response["data_vars"].keys())
    expect = ["air_temperature"]
    assert actual == expect


@pytest.mark.skip("needs attention")
def test_points_endpoint(tmpdir):
    config_path = str(tmpdir / "test-config.yaml")
    netcdf_path = str(tmpdir / "test-netcdf.nc")

    # Config file
    with open(config_path, "w") as stream:
        yaml.dump(sample_config(netcdf_path), stream)

    # NetCDF file
    sample_h5netcdf(netcdf_path)

    # Patch config
    settings = config.Settings(config_file=config_path)
    main.app.dependency_overrides[config.get_settings] = lambda: settings

    # System under test
    response = client.get("/datasets/0/times/0/points")

    # Assert response
    actual = response.json()
    assert actual["attrs"]["long_name"] == "toa_brightness_temperature"


@pytest.mark.skip("broken test")
def test_times_endpoint(tmpdir):
    config_path = str(tmpdir / "test-config.yaml")

    # Config file
    data = {
        "datasets": [{
            "label": "RDT",
            "driver": {
                "name": "rdt",
                "settings": {}
            }
        }]
    }
    with open(config_path, "w") as stream:
        yaml.dump(data, stream)

    # Patch config
    settings = config.Settings(config_file=config_path)
    main.app.dependency_overrides[config.get_settings] = lambda: settings

    # System under test
    response = client.get("/datasets/RDT/times")

    # Assert response
    actual = response.json()

    assert actual == {}
