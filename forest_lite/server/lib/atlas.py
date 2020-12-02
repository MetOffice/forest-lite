"""Map features lakes, borders etc."""
import forest.data
import cartopy.feature
from forest.data import xs_ys, cut, iterlines


def load_feature(feature, scale, extent):
    if feature.lower() == "borders":
        return borders()
    elif feature.lower() == "coastlines":
        return coastlines(scale, extent)
    elif feature.lower() == "lakes":
        # Lake Victoria
        extent = (-10, 50, -20, 10)
        return lakes(extent)
    elif feature.lower() == "disputed":
        return disputed_borders()
    else:
        raise Exception(f"Unrecognised feature: {feature}")


def borders():
    """Country borders"""
    return xs_ys(iterlines(
        cartopy.feature.NaturalEarthFeature(
            'cultural',
            'admin_0_boundary_lines_land',
            '50m').geometries()))


def coastlines(scale="110m", extent=None):
    """Continent and island coastlines"""
    feature = cartopy.feature.NaturalEarthFeature('physical',
                                                  'coastline',
                                                  scale)
    if extent is None:
        geometries = feature.geometries()
    else:
        geometries = feature.intersecting_geometries(extent)
    return xs_ys(cut(iterlines(geometries), 180))


def lakes(extent):
    """Lakes"""
    return xs_ys(iterlines(
        cartopy.feature.NaturalEarthFeature(
            'physical',
            'lakes',
            '10m').intersecting_geometries(extent)))


def disputed_borders():
    """Politically disputed areas"""
    return xs_ys(iterlines(
            cartopy.feature.NaturalEarthFeature(
                "cultural",
                "admin_0_boundary_lines_disputed_areas",
                "50m").geometries()))
