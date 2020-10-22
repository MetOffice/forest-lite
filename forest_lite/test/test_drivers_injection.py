from forest_lite.server.inject import Use
from unittest.mock import sentinel


def test_dependency_injection_container():
    container = Use(sentinel.callback)
    assert container.dependency == sentinel.callback
