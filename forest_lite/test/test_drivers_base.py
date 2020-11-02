from forest_lite.server.drivers.base import BaseDriver


def test_base_driver_api():
    driver = BaseDriver()
    assert driver.get_times() == []
    assert driver.tilable(timestamp_ms=None, data_var=None) == {
        "latitude": [],
        "longitude": [],
        "values": []
    }
    assert driver.description() == {}
