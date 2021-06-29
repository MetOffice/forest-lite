"""

Taken from FOREST project and trimmed down to essential methods

"""
import numpy as np
from forest_lite.server.lib import geo
try:
    import shapely.geometry
except ImportError:
    # ReadTheDocs unable to pip install shapely
    pass


def xs_ys(lines):
    """Map to Web Mercator projection and bokeh multi_line structure"""
    xs, ys = [], []
    for lons, lats in lines:
        x, y = geo.web_mercator(lons, lats)
        xs.append(x)
        ys.append(y)
    return {
        "xs": xs,
        "ys": ys
    }


def cut(lines, x):
    """Cut lines in two if they cross a vertical line"""
    for line in lines:
        xs, ys = line
        xs, ys = np.ma.asarray(xs), np.ma.asarray(ys)
        if (np.min(xs) < x) and (np.max(xs) > x):
            pts = np.ma.asarray(xs) < x
            yield xs[pts], ys[pts]
            yield xs[~pts], ys[~pts]
        else:
            yield line


def iterlines(geometries):
    """Iterate lines from cartopy geometry"""
    def xy(g):
        if isinstance(g, shapely.geometry.LineString):
            return g.xy
        else:
            return g.exterior.coords.xy
    for geometry in geometries:
        try:
            for g in geometry:
                yield xy(g)
        except TypeError:
            yield xy(geometry)
