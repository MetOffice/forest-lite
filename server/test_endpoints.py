import pytest
from fastapi.testclient import TestClient
import yaml
import h5netcdf
import numpy as np
import main, config


client = TestClient(main.app)


def sample_h5netcdf(path):
    # EIDA50 sample
    with h5netcdf.File(path, "w") as f:
        f.dimensions = {
            "time": 1,
            "longitude": 2,
            "latitude": 2}

        # Time
        v = f.create_variable("time", ("time",), "d")
        v[:] = 0
        v.attrs.update({
            "axis": "T",
            "units": "hours since 1970-01-01 00:00:00",
            "standard_name": "time",
            "calendar": "gregorian"
        })

        # Longitude
        v = f.create_variable("longitude", ("longitude",), "f")
        v[:] = [-90, 90]
        v.attrs.update({
            "axis": "X",
            "units": "degrees_east",
            "standard_name": "longitude",
        })

        # Latitude
        v = f.create_variable("latitude", ("latitude",), "f")
        v[:] = [-45, 45]
        v.attrs.update({
            "axis": "Y",
            "units": "degrees_north",
            "standard_name": "latitude",
        })

        # Data
        v = f.create_variable("data",
                              ("time", "latitude", "longitude"), "f")
        v[:] = [[0, 1], [2, 3]]
        v.attrs.update({
            "_FillValue": -99999.,
            "units": "K",
            "standard_name": "toa_brightness_temperature",
            "long_name": "toa_brightness_temperature",
        })


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
    config_path = str(tmpdir / "test-config.yaml")
    netcdf_path = str(tmpdir / "test-netcdf.nc")

    # Config file
    with open(config_path, "w") as stream:
        yaml.dump(sample_config(netcdf_path), stream)

    # NetCDF file
    sample_h5netcdf(netcdf_path)

    # System under test
    settings = config.Settings(config_file=config_path)
    main.app.dependency_overrides[main.get_settings] = lambda: settings
    response = client.get("/datasets/0/times/0/tiles/0/0/0")
    actual = response.json()

    # Assert response
    assert actual["dataset_id"] == 0
    assert actual["timestamp_ms"] == 0
    assert actual["tile"] == [0, 0, 0]
    assert actual["data"]["x"] == [-20037508.342789244]
    assert actual["data"]["y"] == [-20037508.342789255]
    assert actual["data"]["dw"] == [40075016.68557849]
    assert actual["data"]["dh"] == [40075016.685578495]
    # assert np.shape(actual["data"]["image"][0]) == (64, 64)


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
    main.app.dependency_overrides[main.get_settings] = lambda: settings

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
    main.app.dependency_overrides[main.get_settings] = lambda: settings

    # System under test
    response = client.get("/datasets/RDT/times")

    # Assert response
    actual = response.json()

    assert actual == {}
