"""Example Python I/O library"""
import xarray
import numpy as np
import datetime as dt
import forest.geo


def data_times(dataset):
    """Datetime information related to dataset"""
    return {
        "x": [dt.datetime.now()]
    }


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


def image_data(name, path):
    n = 256
    print(path)
    if name == "EIDA50":
        with xarray.open_dataset(path, engine="h5netcdf") as nc:
            lons = nc["longitude"].values
            lats = nc["latitude"].values
            values = nc["data"][0].values
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
