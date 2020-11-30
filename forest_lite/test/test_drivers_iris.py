import os
import pytest
from forest_lite.server.drivers import find_driver, BaseDriver


SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "sample")


@pytest.fixture
def sample_file():
    return os.path.join(SAMPLE_DIR, "iris_sample.pp")


@pytest.mark.parametrize("name", [
    "xarray_h5netcdf",
    "nearcast",
    "iris"
])
def test_find_driver(name):
    assert isinstance(find_driver(name), BaseDriver)


def test_iris_descriptions(sample_file):
    driver = find_driver("iris")
    settings = {"pattern": sample_file}
    data_var = "relative_humidity"
    units = "%"
    actual = driver.description(settings)
    assert actual.attrs == {}
    assert actual.data_vars[data_var].dims == []
    assert actual.data_vars[data_var].attrs.long_name == data_var
    assert actual.data_vars[data_var].attrs.units == units
