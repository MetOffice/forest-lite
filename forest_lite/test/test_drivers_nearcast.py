import pygrib
import json
import os
import pytz
import datetime as dt
import pytest
from forest_lite.server.drivers import nearcast
from forest_lite.server.drivers.nearcast import (driver,
                                                 parse_date,
                                                 get_data_vars,
                                                 get_first_fixed_surface,
                                                 get_validity)
from forest_lite.server.drivers.base import BaseDriver
from numpy.testing import assert_array_almost_equal


UTC = pytz.timezone('UTC')
SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "sample")


@pytest.fixture
def real_file():
    return os.path.join(SAMPLE_DIR,
                        "NEARCAST_20210125_0000_LAKEVIC_LATLON.GRIB2")


@pytest.fixture
def sample_file():
    return os.path.join(SAMPLE_DIR, "nearcast.grib2")


@pytest.fixture
def settings(sample_file):
    return {"pattern": sample_file}


@pytest.fixture
def data_var():
    return "Pseudo-adiabatic potential temperature"


def test_importable():
    assert isinstance(driver, BaseDriver)


def test_description(settings):
    actual = driver.description(settings).dict()
    assert actual["attrs"] == {
        "product": "Nearcast",
        "reference": "CIMSS, University Wisconsin-Madison",
    }
    data_var = "Pseudo-adiabatic potential temperature"
    assert actual["data_vars"][data_var] == {
        "dims": ["start_time", "time", "level"],
        "attrs": {
            "long_name": "Pseudo-adiabatic potential temperature",
            "units": "K"
        }
    }


@pytest.mark.parametrize("object_key,expected", [
    ("NEARCAST_20210125_0000_LAKEVIC_LATLON.GRIB2", dt.datetime(2021, 1, 25,
                                                                tzinfo=UTC)),
    ("nearcast.grib2", None)
])
def test_parse_date(object_key, expected):
    actual = parse_date(object_key)
    assert actual == expected


def test_driver_points(settings):
    data_var = ""
    dim_name = nearcast.DIMENSION.start_time.name
    actual = driver.points(settings, data_var, dim_name)["data"]
    expected = [dt.datetime(1970, 1, 1)]
    assert actual == expected


def test_driver_points_given_start_time_query():
    # query comes from REST endpoint is datetime support relevant?
    settings = nearcast.Settings(pattern=os.path.join(SAMPLE_DIR, "*GRIB2"))
    start_date = dt.datetime(2021, 1, 21, 0, 30, tzinfo=UTC)
    query = json.dumps({nearcast.DIMENSION.start_time.name: str(start_date)})
    dim_name = nearcast.DIMENSION.time.name
    data_var = "U component of wind"
    response = driver.points(settings, data_var, dim_name, query=query)
    actual = response["data"][0]
    expected = start_date
    assert actual == expected


def test_driver_tilable(settings, data_var):
    time = dt.datetime(2019, 12, 16, 14, 30, tzinfo=UTC)
    timestamp_ms = time.timestamp() * 1000
    query = json.dumps({
        "time": timestamp_ms
    })
    actual = driver.tilable(settings, data_var, query=query)
    expected = (300,)
    assert actual["latitude"].shape == expected


def test_get_validity(sample_file, data_var):
    actual = list(get_validity(sample_file, data_var))
    expected = [dt.datetime(2019, 12, 16, 14, 30, tzinfo=UTC)]
    assert actual == expected


def test_get_first_fixed_surface(sample_file, data_var):
    actual = list(get_first_fixed_surface(sample_file, data_var))
    expected = [1]
    assert actual == expected


def test_get_data_vars_given_sample_file(sample_file):
    actual = list(get_data_vars(sample_file))
    expected = [{
        "name": "Pseudo-adiabatic potential temperature",
        "units": "K"
    }]
    assert actual == expected


def test_get_data_vars_given_real_file(real_file):
    actual = list(get_data_vars(real_file))
    expected = [{
        "name": "Pseudo-adiabatic potential temperature",
        "units": "K"
    }, {
        "name": "Precipitable water",
        "units": "kg m**-2"
    }, {
        "name": "U component of wind",
        "units": "m s**-1"
    }, {
        "name": "V component of wind",
        "units": "m s**-1"
    }]

    def tuples(items):
        return set([(item["name"], item["units"]) for item in items])

    assert tuples(actual) == tuples(expected)


@pytest.mark.parametrize("var_name", [
    "Pseudo-adiabatic potential temperature",
    "Precipitable water",
    "U component of wind",
    "V component of wind",
])
def test_get_first_fixed_surface_given_real_file(real_file, var_name):
    actual = sorted(set((get_first_fixed_surface(real_file, var_name))))
    # expected = [1, 699999988, 899999976]
    expected = [1, 699, 899]
    assert actual == expected


@pytest.mark.parametrize("var_name", [
    "Pseudo-adiabatic potential temperature",
    "Precipitable water",
    "U component of wind",
    "V component of wind",
])
def test_get_validity_given_real_file(real_file, var_name):
    start = dt.datetime(2021, 1, 25, 0, 0, tzinfo=UTC)
    actual = sorted(set((get_validity(real_file, var_name))))
    expected = [start + i * dt.timedelta(minutes=30) for i in range(19)]
    assert actual == expected


def test_get_validity_given_real_file_unknown_variable(real_file):
    actual = sorted(set((get_validity(real_file, "foo"))))
    expected = []
    assert actual == expected


def test_parse_date_given_real_file(real_file):
    assert parse_date(real_file) == dt.datetime(2021, 1, 25, tzinfo=UTC)


def test_tilable_given_real_file(real_file):
    settings = {"pattern": real_file}
    data_var = "U component of wind"
    time = dt.datetime(2021, 1, 25, 0, 0, 0, tzinfo=UTC)
    timestamp_ms = time.timestamp() * 1000
    level = 699999988
    query = json.dumps({
        "start_time": 0,
        "time": timestamp_ms,
        "level": level
    })
    obj = driver.tilable(settings, data_var, query=query)
    actual = obj["values"]
    expected = [1, 2, 3]
    assert actual[0, 0] == -7.644691467285156e-1
    # assert_array_almost_equal(actual, expected)


@pytest.mark.parametrize("date,expected", [
    (dt.datetime(1970, 1, 1, 0, 0, 0, tzinfo=UTC), 0),
    (dt.datetime(2021, 1, 25, 0, 0, 0, tzinfo=UTC), 1611532800),
])
def test_datetime_to_timestamp(date, expected):
    assert date.timestamp() == expected


def test_pygrib_select_real_file(real_file):
    name = "U component of wind"
    messages = pygrib.index(real_file,
                            "name",
                            "validityTime",
                            "scaledValueOfFirstFixedSurface")
    time = 0  # NOTE: zero-padded strings raise Runtime errors
    # level = 899999976
    level = 899
    actual = []
    for message in messages.select(name=name,
                                   validityTime=time,
                                   scaledValueOfFirstFixedSurface=level):
        actual.append(message["scaledValueOfFirstFixedSurface"])
    messages.close()
    assert actual == [level]


@pytest.mark.parametrize("date,path,time", [
    pytest.param(dt.datetime(2021, 1, 25, 0, 31, tzinfo=UTC),
                 "NEARCAST_20210125_0030_LAKEVIC_LATLON.GRIB2",
                 dt.datetime(2021, 1, 25, 0, 30, tzinfo=UTC), id="during"),
    pytest.param(dt.datetime(2021, 1, 26, 0, 0, tzinfo=UTC),
                 "NEARCAST_20210125_0100_LAKEVIC_LATLON.GRIB2",
                 dt.datetime(2021, 1, 25, 1, 0, tzinfo=UTC), id="after"),
    pytest.param(dt.datetime(2021, 1, 20, 0, 0, tzinfo=UTC),
                 "NEARCAST_20210125_0000_LAKEVIC_LATLON.GRIB2",
                 dt.datetime(2021, 1, 25, 0, 0, tzinfo=UTC), id="before"),
])
def test_find_nearest(date, path, time):
    file_names = ["NEARCAST_20210125_0000_LAKEVIC_LATLON.GRIB2",
                  "NEARCAST_20210125_0030_LAKEVIC_LATLON.GRIB2",
                  "NEARCAST_20210125_0100_LAKEVIC_LATLON.GRIB2"]
    actual = nearcast.find_nearest(file_names, date)
    assert actual.path == path
    assert actual.timestamp == time
