from fastapi.testclient import TestClient
from forest_lite.server import main, config
from forest_lite.server.lib.config import Config
from forest_lite.test import helpers
import pytest

client = TestClient(main.app)


def use_settings(props):
    """Override get_settings runtime dependency"""
    settings = Config(**props)
    main.app.dependency_overrides[config.get_settings] = lambda: settings


@pytest.mark.parametrize("dataset_id", [
    3, 7
])
def test_get_dataset_palette(dataset_id):
    """HTTP GET endpoint to map variable to colors/limits"""
    # Fake config
    var_name = "air_temperature"
    colors = ["#FFF", "#000"]
    lows = [0, 1, 1, 2, 3, 5, 8, 13, 21, 44]
    highs = [1, 2, 3, 5, 7, 11, 13, 17, 19, 23]
    use_settings({
        "datasets": [
            {
                "label": "Label",
                "palettes": {
                    var_name: {
                        "colors": colors,
                        "low": low,
                        "high": high
                    }
                }
            }
            for low, high in zip(lows, highs)
        ]
    })

    # System under test
    response = client.get("/datasets")
    links = response.json()["datasets"][dataset_id]["links"]
    url = links["palette"]
    response = client.get(url)
    actual = response.json()

    # Assertions
    expected = {
        var_name: {
            "colors": colors,
            "low": lows[dataset_id],
            "high": highs[dataset_id]
        }
    }
    assert expected == actual


@pytest.fixture
def sample_file(tmpdir):
    path = str(tmpdir / "sample.nc")
    helpers.sample_h5netcdf(path)
    return path


def test_get_dataset_data_vars(sample_file):
    """HTTP GET endpoint variable meta-data"""
    # Fake config
    var_name = "air_temperature"
    use_settings({
        "datasets": [
            {
                "label": "Label",
                "driver": {
                    "name": "xarray_h5netcdf",
                    "settings": {
                        "pattern": sample_file
                    }
                }
            }
        ]
    })

    # System under test
    index = 0
    response = client.get("/datasets")
    links = response.json()["datasets"][index]["links"]
    url = links["data_vars"]
    response = client.get(url)
    actual = response.json()

    # Assertions
    expected = {
        "dataset_id": 0,
        "attrs": {},
        "coords": {
            "latitude": {
                "attrs": {
                    "axis": "Y",
                    "standard_name": "latitude",
                    "units": "degrees_north"
                },
                "dims": ["latitude"],
                "dtype": "float32",
                "shape": [2]
            },
            "longitude": {
                "attrs": {
                    "axis": "X",
                    "standard_name": "longitude",
                    "units": "degrees_east"
                },
                "dims": ["longitude"],
                "dtype": "float32",
                "shape": [2]
            },
            "time": {
                "attrs": {
                    "axis": "T",
                    "standard_name": "time",
                },
                "dims": ["time"],
                "dtype": "datetime64[ns]",
                "shape": [1]
            }
        },
        "dims": {
            "latitude": 2,
            "longitude": 2,
            "time": 1
        },
        "data_vars": {
            "data": {
                "attrs": {
                    "long_name": "toa_brightness_temperature",
                    "standard_name": "toa_brightness_temperature",
                    "units": "K"
                },
                "dims": [ "time", "latitude", "longitude" ],
                "dtype": "float32",
                "shape": [1, 2, 2]
            }
        }
    }
    assert expected == actual
