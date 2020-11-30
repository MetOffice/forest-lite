import pytest
from forest_lite.server.drivers import find_driver, BaseDriver


@pytest.mark.parametrize("name", [
    "xarray_h5netcdf",
    "nearcast",
    "iris"
])
def test_find_driver(name):
    assert isinstance(find_driver(name), BaseDriver)
