from forest_lite.server.drivers.base import BaseDriver


def test_base_driver_api():
    driver = BaseDriver()
    assert driver.get_times() == []
    tilable = driver.tilable(timestamp_ms=None, data_var=None)
    assert tilable["latitude"] == []
    assert tilable["longitude"] == []
    assert tilable["values"].shape == (0, 0)
    assert tilable["units"] == ""
    assert driver.description() == {}
