import datetime as dt
import os
import iris
from iris.coord_systems import RotatedGeogCS
import pytest
from forest_lite.server.drivers import find_driver, BaseDriver
from forest_lite.server.drivers.iris import data_vars, fromisoformat
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


def test_driver_points(sample_file):
    driver = find_driver("iris")
    settings = {"pattern": sample_file}
    data_var = "relative_humidity"
    dim_name = "time"
    actual = driver.points(settings, data_var, dim_name)
    expected = ["2020-04-17T03:00:00",
                "2020-04-17T04:00:00",
                "2020-04-17T05:00:00"]
    assert actual["data"] == expected


@pytest.mark.parametrize("time", [
    "2020-04-17T03:00:00",
    "2020-04-17T03:00:00Z"
])
def test_driver_tilable(sample_file, time):
    driver = find_driver("iris")
    settings = {"pattern": sample_file}
    data_var = "relative_humidity"
    pressure = 1000
    query = {
        "time": time,
        "pressure": pressure,
        "forecast_reference_time": time,
        "forecast_period": 0
    }
    actual = driver.tilable(settings, data_var, query=query)
    assert actual["values"].shape == (8, 9)


@pytest.mark.parametrize("time", [
    "2020-04-17T03:00:00",
    "2020-04-17T03:00:00Z"
])
def test_fromisoformat(time):
    assert fromisoformat(time) == dt.datetime(2020, 4, 17, 3)


def test_iris_descriptions(sample_file):
    driver = find_driver("iris")
    settings = {"pattern": sample_file}
    data_var = "relative_humidity"
    units = "%"
    dims = ["time",
            "pressure",
            "grid_latitude",
            "grid_longitude",
            "forecast_reference_time",
            "forecast_period"]
    actual = driver.description(settings)
    assert actual.attrs == {}
    assert actual.data_vars[data_var].dims == dims
    assert actual.data_vars[data_var].attrs.long_name == data_var
    assert actual.data_vars[data_var].attrs.units == units


def test_data_vars(cubes):
    actual = data_vars(cubes)
    name = "relative_humidity"
    dims = ["time",
            "pressure",
            "grid_latitude",
            "grid_longitude",
            "forecast_reference_time",
            "forecast_period"]
    expected = {name: DataVar(dims=dims, attrs={
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


def test_cube_dims(cubes):
    actual = [coord.name() for coord in cubes[0].coords()]
    expected = ["time",
                "pressure",
                "grid_latitude",
                "grid_longitude",
                "forecast_reference_time",
                "forecast_period"]
    assert actual == expected


def test_cube_coords_points(cubes):
    times = [cell.point for cell in cubes[0].coord("time").cells()]
    actual = [time.strftime("%Y%m%dT%H%MZ") for time in times]
    expected = ["20200417T0300Z", "20200417T0400Z", "20200417T0500Z"]
    assert actual == expected


def test_cube_extract_time(cubes):
    time = dt.datetime(2020, 4, 17, 3)
    cube = cubes[0]
    actual = cube.extract(iris.Constraint(time=time))
    assert cube.shape == (3, 13, 8, 9)
    assert actual.shape == (13, 8, 9)


def test_unrotate_pole(cubes):
    cube = cubes[0]
    coord_system = cube.coord_system()
    assert isinstance(coord_system, RotatedGeogCS)
