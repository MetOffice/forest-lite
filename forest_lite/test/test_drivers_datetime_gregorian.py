import pytest
import cftime
import json
import numpy as np


@pytest.fixture
def gregorian():
    return cftime.DatetimeGregorian(2021, 1, 1)


def test_json_serializable_numpy_array(gregorian):
    x = np.array([gregorian])
    expected = '["2021-01-01 00:00:00"]'
    assert json.dumps(x.tolist(), default=str) == expected


def test_json_serializable(gregorian):
    assert json.dumps(gregorian, default=str) == '"2021-01-01 00:00:00"'


def test_datetime_gregorian_to_miliseconds(gregorian):
    assert cftime.date2num(gregorian) == 0
