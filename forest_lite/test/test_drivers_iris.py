import os
import iris
import pytest
from forest_lite.server.drivers import find_driver, BaseDriver
from forest_lite.server.drivers.iris import data_vars
from forest_lite.server.drivers.types import DataVar


SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "sample")


@pytest.fixture
def sample_file():
    return os.path.join(SAMPLE_DIR, "iris.pp")


@pytest.fixture
def cubes(sample_file):
    return iris.load(sample_file)


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


def test_data_vars(cubes):
    actual = data_vars(cubes)
    name = "relative_humidity"
    expected = {name: DataVar(dims=[], attrs={
        "long_name": "relative_humidity",
        "units": "%"
    })}
    assert actual[name].dims == expected[name].dims
    assert actual[name].attrs.dict() == expected[name].attrs.dict()


def test_cube_attributes(cubes):
    actual = cubes[0].attributes
    assert actual["source"] == "Data from Met Office Unified Model"
    assert actual["um_version"] == "11.2"
    assert str(actual["STASH"]) == "m01s16i204"


def test_cube_units(cubes):
    assert str(cubes[0].units) == "%"
