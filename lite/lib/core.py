"""Example Python I/O library"""
import glob
import xarray
import numpy as np
import datetime as dt
import forest.geo
import lib.tiling


TILE_SIZE = 64  # 128


def get_data_tile(config, dataset_name, timestamp_ms, z, x, y):
    time = np.datetime64(timestamp_ms, 'ms')
    path = get_path(config, dataset_name)
    zxy = (z, x, y)
    with xarray.open_dataset(path, engine="h5netcdf") as nc:
        lons = nc["longitude"].values
        lats = nc["latitude"].values
        pts = np.where(nc.time.values == time)
        if len(pts[0]) > 0:
            i = pts[0][0]
            values = nc["data"][i].values
    return lib.tiling.data_tile(lons, lats, values, zxy,
                                tile_size=TILE_SIZE)


def get_points(path, time):
    with xarray.open_dataset(path, engine="h5netcdf") as nc:
        pts = np.where(nc.time.values == time)
        if len(pts[0]) > 0:
            i = pts[0][0]
            data_array = nc["data"][i][::10, ::20]
    return data_array.to_dict()


def get_path(config, dataset_name):
    for dataset in config.datasets:
        if dataset.label == dataset_name:
            pattern = dataset.driver.settings["pattern"]
            paths = sorted(glob.glob(pattern))
            if len(paths) > 0:
                return paths[-1]
    raise Exception(f"{dataset_name} path not found")


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


def get_times(dataset_name, path):
    with xarray.open_dataset(path, engine="h5netcdf") as nc:
        times = nc.time.values
    return times


def image_data(name, path, timestamp_ms, tile_size=TILE_SIZE):
    n = tile_size
    time = np.datetime64(timestamp_ms, 'ms')
    if name == "EIDA50":
        with xarray.open_dataset(path, engine="h5netcdf") as nc:
            lons = nc["longitude"].values
            lats = nc["latitude"].values
            pts = np.where(nc.time.values == time)
            if len(pts[0]) > 0:
                i = pts[0][0]
                values = nc["data"][i].values
        data = forest.geo.stretch_image(lons,
                                        lats,
                                        values,
                                        plot_width=n,
                                        plot_height=n)
        return data
    elif name == "Operational Africa":
        with xarray.open_dataset(path, engine="h5netcdf") as nc:
            lons = nc["longitude"].values
            lats = nc["latitude"].values
            values = nc["relative_humidity"][0, 0].values
        data = forest.geo.stretch_image(lons,
                                        lats,
                                        values,
                                        plot_width=n,
                                        plot_height=n)
        return data
    else:
        image = np.linspace(0, 11, n*n, dtype=np.float).reshape((n, n))
        return {
            "x": [0],
            "y": [0],
            "dw": [1e6],
            "dh": [1e6],
            "image": [
                image
            ]
        }
