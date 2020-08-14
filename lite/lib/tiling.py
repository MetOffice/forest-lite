"""Wrap forest.geo to make an easier interface"""
import cartopy
import numpy as np
import forest.geo


GOOGLE_X_LIMITS = cartopy.crs.Mercator.GOOGLE.x_limits
GOOGLE_Y_LIMITS = cartopy.crs.Mercator.GOOGLE.y_limits


def _start(limits):
    return limits[0]


def _extent(limits):
    return limits[1] - limits[0]


def data_tile(lons, lats, values, zxy, tile_size=128):
    """Convenient function to generate data tile"""
    level, _, _ = zxy
    gx, gy = web_mercator(lons, lats)
    x_range, y_range = tile_extents(zxy)
    image = forest.geo.datashader_stretch(values, gx, gy,
                                          x_range,
                                          y_range,
                                          plot_width=tile_size,
                                          plot_height=tile_size)
    # Convert tile information to Bokeh image data
    x = x_range[0]
    y = y_range[0]
    dw = x_range[1] - x_range[0]
    dh = y_range[1] - y_range[0]
    return {
        "x": [x],
        "y": [y],
        "dw": [dw],
        "dh": [dh],
        "image": [image],
        "level": [level]
    }


def tile_extents(zxy):
    """Calculate tile x/y-range from {Z}/{X}/{Y}.png values"""
    level, i, j = zxy
    x0 = _start(GOOGLE_X_LIMITS)
    y0 = _start(GOOGLE_Y_LIMITS)
    dx = _extent(GOOGLE_X_LIMITS) / (2 ** level)
    dy = _extent(GOOGLE_Y_LIMITS) / (2 ** level)
    x_range = (x0 + i * dx, x0 + (i + 1) * dx)
    y_range = (y0 + j * dy, y0 + (j + 1) * dy)
    return x_range, y_range


def web_mercator(lons, lats):
    """Similar to forest.geo.web_mercator but preserves array shape"""
    if (lons.ndim == 1):
        gx, _ = forest.geo.web_mercator(
            lons,
            np.zeros(len(lons), dtype="d"))
        _, gy = forest.geo.web_mercator(
            np.zeros(len(lats), dtype="d"),
            lats)
        return gx, gy
    elif (lons.ndim == 2) and (lats.ndim == 2):
        gx, gy = forest.geo.web_mercator(lons, lats)
        gx = gx.reshape(lons.shape)
        gx = np.ma.masked_invalid(gx)
        gy = gy.reshape(lats.shape)
        gy = np.ma.masked_invalid(gy)
        return gx, gy
    else:
        raise Exception("Either 1D or 2D lons/lats")
