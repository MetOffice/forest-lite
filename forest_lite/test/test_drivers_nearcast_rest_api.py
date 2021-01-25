import pytest
import os
import json
import datetime as dt
import pytz
from fastapi.testclient import TestClient
from forest_lite.server import main, config


client = TestClient(main.app)


def override_settings(data):
    settings = config.Settings(**data)
    main.app.dependency_overrides[config.get_settings] = lambda: settings


SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "sample")


def test_nearcast_axis_response():
    pattern = os.path.join(SAMPLE_DIR, "NEARCAST_*.GRIB2")
    override_settings({
        "datasets": [
            {
                "label": "Label",
                "driver": {
                    "name": "nearcast",
                    "settings": {
                        "pattern": pattern
                    }
                }
            }
        ]
    })
    dataset_id = 0
    variable = "U component of wind"
    dimension = "start_time"
    url = f"/datasets/{dataset_id}/{variable}/axis/{dimension}"

    # System under test
    response = client.get(url)

    # Assertions
    actual = response.json()
    stamps = [
        in_timestamp_ms(2021, 1, 21, 0, 30),
        in_timestamp_ms(2021, 1, 21, 1, 0),
        in_timestamp_ms(2021, 1, 25, 0, 0)
    ]
    expected = {
        "attrs": {
            "standard_name": "time",
            "units": ""
        },
        "data": stamps,
        "data_var": variable,
        "dim_name": dimension
    }
    assert actual == expected


def test_nearcast_axis_time_given_start_time():
    pattern = os.path.join(SAMPLE_DIR, "NEARCAST_*_LAKEVIC_LATLON.GRIB2")
    override_settings({
        "datasets": [
            {
                "label": "Label",
                "driver": {
                    "name": "nearcast",
                    "settings": {
                        "pattern": pattern
                    }
                }
            }
        ]
    })
    dataset_id = 0
    variable = "U component of wind"
    dimension = "time"

    # Use query string to be precise about which time axis
    query = json.dumps({"start_time": in_timestamp_ms(2021, 1, 21, 1)})
    path = f"/datasets/{dataset_id}/{variable}/axis/{dimension}"
    url = f"{path}?query={query}"

    # System under test
    response = client.get(url)

    # Assertions
    actual = response.json()
    start = dt.datetime(2021, 1, 21, 1)
    interval = dt.timedelta(minutes=30)
    dates = [start + i*interval for i in range(19)]
    assert [from_timestamp_ms(t) for t in actual["data"]] == dates
    stamps = [to_timestamp_ms(t) for t in dates]
    expected = {
        "attrs": {
            "standard_name": "time",
            "units": ""
        },
        "data": stamps,
        "data_var": variable,
        "dim_name": dimension
    }
    assert actual == expected


def test_nearcast_tiles_zyx():
    pattern = os.path.join(SAMPLE_DIR, "NEARCAST_*_LAKEVIC_LATLON.GRIB2")
    override_settings({
        "datasets": [
            {
                "label": "Label",
                "driver": {
                    "name": "nearcast",
                    "settings": {
                        "pattern": pattern
                    }
                }
            }
        ]
    })
    dataset_id = 0
    variable = "Pseudo-adiabatic potential temperature"
    dimension = "time"

    # Use query string to be precise about which time axis
    query = json.dumps({"start_time": "2021-01-25T00:00:00Z",
                        "time": "2021-01-25T03:30:00Z",
                        "level": 1})
    path = f"/datasets/{dataset_id}/{variable}/tiles/1/0/0"
    url = f"{path}?query={query}"

    # System under test
    response = client.get(url)


def from_timestamp_ms(number):
    return dt.datetime.fromtimestamp(number / 1000.)


def to_timestamp_ms(date):
    return date.timestamp() * 1000.


def in_timestamp_ms(*args):
    utc = pytz.timezone('UTC')
    time = dt.datetime(*args, tzinfo=utc)
    return time.timestamp() * 1000
