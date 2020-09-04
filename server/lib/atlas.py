"""Map features lakes, borders etc."""
import forest.data
import cartopy.feature
from forest.data import xs_ys, iterlines


def load_feature(feature):
    if feature.lower() == "borders":
        return borders()
    elif feature.lower() == "coastlines":
        return coastlines()
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


def coastlines():
    """Continent and island coastlines"""
    return forest.data.load_coastlines()


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
