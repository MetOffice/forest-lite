import pytest
import datetime as dt
from forest_lite.server.drivers import rdt


@pytest.mark.skip("broken test")
def test_get_times():
    limit = 1
    result = rdt.get_times(limit)
    expect = [dt.datetime(2020, 9, 4, 15, 0)]
    assert result == expect
