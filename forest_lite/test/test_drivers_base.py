from forest_lite.server.drivers.base import BaseDriver


def test_base_driver_api():
    driver = BaseDriver()
    settings = {}
    data_var = None
    timestamp_ms = 0
    tilable = driver.tilable(settings, data_var, timestamp_ms)
    assert tilable["latitude"] == []
    assert tilable["longitude"] == []
    assert tilable["values"].shape == (0, 0)
    assert tilable["units"] == ""
    assert driver.description(settings) == {}
