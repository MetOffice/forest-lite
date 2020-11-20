from forest_lite.server.lib.tiling import (
    GOOGLE_X_LIMITS,
    GOOGLE_Y_LIMITS
)


def test_google_x_limits():
    low, high = GOOGLE_X_LIMITS
    assert low == -20037508.342789244
    assert high == 20037508.342789244


def test_google_y_limits():
    low, high = GOOGLE_Y_LIMITS
    assert low == -20037508.342789255
    assert high == 20037508.342789244
