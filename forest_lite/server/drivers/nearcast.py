"""
Nearcast driver
"""
from forest_lite.server.drivers.base import BaseDriver


driver = BaseDriver()


@driver.get_times
def nearcast_times(limits=None):
    return []
