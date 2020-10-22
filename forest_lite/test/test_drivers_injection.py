from forest_lite.server.inject import Use, Injectable
from unittest.mock import sentinel, Mock


def test_dependency_injection_container():
    container = Use(sentinel.callback)
    assert container.dependency == sentinel.callback


def test_override_mechanism():
    custom_fn = Mock()

    class Driver(Injectable):
        def method(self):
            raise Exception

    driver = Driver()
    driver.override("method")(custom_fn)
    driver.method()

    custom_fn.assert_called_once_with()
