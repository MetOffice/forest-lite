"""Example Python I/O library"""
import glob
import xarray
import numpy as np
from forest_lite.server.lib import tiling


TILE_SIZE = 256 # 256 # 64  # 128


def _tile(tilable, z, x, y):
    """Convenient interface for extension drivers"""
    zxy = (z, x, y)
    if "errors" in tilable:
        # TODO formalise error handling
        print(tilable)
        return tilable
    if "longitude" in tilable:
        lons = tilable["longitude"]
        lats = tilable["latitude"]
        web_mercator_x, web_mercator_y = tiling.web_mercator(lons, lats)
    else:
        web_mercator_x = tilable["web_mercator_x"]
        web_mercator_y = tilable["web_mercator_y"]
    values = tilable["values"]
    units = tilable["units"]
    data = tiling.data_tile(web_mercator_x, web_mercator_y,
                            values, zxy,
                            tile_size=TILE_SIZE)
    data.update({
        "units": [units],
        "tile_key": [[x, y, z]]
    })
    return data


def get_points(path, time):
    with xarray.open_dataset(path, engine="h5netcdf") as nc:
        pts = np.where(nc.time.values == time)
        if len(pts[0]) > 0:
            i = pts[0][0]
            data_array = nc["data"][i][::10, ::20]
    return data_array.to_dict()


def get_path(pattern):
    paths = sorted(glob.glob(pattern))
    if len(paths) > 0:
        return paths[-1]
    else:
        raise Exception(f"{pattern} path not found")


def xy_data(dataset, variable):
    """X-Y line/circle data related to a dataset"""
    # import time
    # time.sleep(5)  # Simulate expensive I/O or slow server
    if dataset == "takm4p4":
        return {
            "x": [0, 1e5, 2e5],
            "y": [0, 1e5, 2e5]
        }
    else:
        return {
            "x": [0, 1e5, 2e5],
            "y": [0, 3e5, 1e5]
        }
