from forest_lite.server.drivers.nearcast import driver
from forest_lite.server.drivers.base import BaseDriver



def test_importable():
    assert isinstance(driver, BaseDriver)
