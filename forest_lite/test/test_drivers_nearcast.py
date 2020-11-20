import os
import pytest
from forest_lite.server.drivers.nearcast import driver
from forest_lite.server.drivers.base import BaseDriver


SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "sample")


@pytest.fixture
def sample_file():
    return os.path.join(SAMPLE_DIR, "nearcast.grib2")


def test_importable():
    assert isinstance(driver, BaseDriver)


def test_description(sample_file):
    settings = {"pattern": sample_file}
    actual = driver.description(settings).dict()
    assert actual["attrs"] == {
        "product": "Nearcast",
        "reference": "CIMSS, University Wisconsin-Madison",
    }
    data_var = "Pseudo-adiabatic potential temperature"
    assert actual["data_vars"][data_var] == {
        "dims": ["time", "level"],
        "attrs": {
            "long_name": "Pseudo-adiabatic potential temperature",
            "units": "K"
        }
    }
