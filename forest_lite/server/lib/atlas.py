"""Map features lakes, borders etc."""
import cartopy.feature
from forest_lite.server.lib.data import xs_ys, cut, iterlines


def load_feature(category, name, scale, extent):
    natural_earth_feature = cartopy.feature.NaturalEarthFeature(
        category,
        name,
        scale)
    return multiline(natural_earth_feature, extent)


def multiline(feature, extent=None):
    """Process cartopy feature"""
    if extent is None:
        geometries = feature.geometries()
    else:
        geometries = feature.intersecting_geometries(extent)
    return xs_ys(cut(iterlines(geometries), 180))
