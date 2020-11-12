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


@pytest.mark.skip("needs attention")
def test_description(sample_file):
    driver.settings = {"pattern": sample_file}
    assert driver.description()["attrs"] == {
        "product": "Nearcast",
        "reference": "CIMSS, University Wisconsin-Madison",
    }
    assert driver.description()["data_vars"] == {
        "Pseudo-adiabatic potential temperature": {
            "attrs": {
                "long_name": "Pseudo-adiabatic potential temperature",
                "units": "K"
            }
        }
    }
