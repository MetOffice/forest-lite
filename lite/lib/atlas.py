"""Map features lakes, borders etc."""
import forest.data
import cartopy.feature
from forest.data import xs_ys, iterlines


def load_feature(feature):
    if feature.lower() == "borders":
        return borders()
    elif feature.lower() == "coastlines":
        return coastlines()
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
    return forest.data.load_coastlines()
