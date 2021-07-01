import os
import glob
import xarray
from forest_lite.server.drivers.base import BaseDriver
from forest_lite.server.lib import core
from pydantic import BaseModel, validator
from typing import List
from functools import lru_cache
import datetime as dt


class Settings(BaseModel):
    pattern: str
    engine: str = "h5netcdf"
    data_vars: List[str] = None


    @validator("pattern")
    def expand_tilda(cls, v):
        return os.path.expanduser(v)


driver = BaseDriver()


@driver.override("data_tile")
def data_tile(settings, data_var, z, x, y, query=None):
    pattern = Settings(**settings).pattern
    engine = Settings(**settings).engine
    return get_data_tile(pattern, engine, data_var, z, x, y, query)


@driver.override("description")
def description(settings):
    settings = Settings(**settings)
    paths = sorted(glob.glob(settings.pattern))
    if len(paths) > 0:
        path = paths[-1]
        with xarray.open_dataset(path,
                                 engine=settings.engine,
                                 decode_times=False) as nc:
            data = nc.to_dict(data=False)
        # Filter data_vars
        if settings.data_vars is not None:
            data["data_vars"] = {
                key: value for key, value in data["data_vars"].items()
                if key in settings.data_vars
            }
        return data
    else:
        return {}


@driver.override("points")
def points(settings, data_var, dim_name, query=None):
    """Coordinate/Dimension meta-data and values"""
    settings = Settings(**settings)
    pattern = settings.pattern
    paths = sorted(glob.glob(pattern))
    attrs = {}
    data = []
    if len(paths) > 0:
        path = paths[-1]
        with xarray.open_dataset(path,
                                 engine=settings.engine,
                                 decode_times=False) as nc:
            attrs = nc[dim_name].attrs
            data = nc[dim_name].values
    return {
        "data_var": data_var,
        "dim_name": dim_name,
        "data": data,
        "attrs": attrs
    }


def get_data_tile(pattern, engine, data_var, z, x, y, query=None):
    if query is not None:
        # Hashable query
        query = frozenset(query.items())
    path = core.get_path(pattern)
    return _data_tile(path, engine, data_var, z, x, y, query)


def is_longitude_dimension(key):
    return key.startswith("longitude") or (key == "lon")


def is_latitude_dimension(key):
    return key.startswith("latitude") or (key == "lat")


@lru_cache
def _data_tile(path, engine, data_var, z, x, y, query):
    zxy = (z, x, y)
    with xarray.open_dataset(path,
                             engine=engine,
                             decode_times=True) as nc:

        # Find lons/lats related to data_var
        var = nc[data_var]
        for key in var.dims:
            if is_longitude_dimension(key):
                lons = var[key].values
            if is_latitude_dimension(key):
                lats = var[key].values

        # Find 2D values array
        if query is None:
            array = nc[data_var]
        else:
            idx = dict(query)

            # Map miliseconds to datetime
            idx = { key: convert_ms(key, value) for key, value in idx.items() }

            try:
                array = nc[data_var].sel(**idx, method="nearest")
            except ValueError as e:
                idx = { key: int(value) for key, value in idx.items() }
                array = nc[data_var].isel(**idx)

        units = getattr(nc[data_var], "units", "")

    # Only allow 2D arrays for tile requests
    if array.ndim != 2:
        return {
            "errors": [
                {"message": "incorrect number of dimensions",
                 "dims": f"{var.dims}"}
            ]
        }

    # Use 2D array
    values = array.values

    # Mask moisture_content_of_soil_layer (TODO: Generalise)
    if "moisture_content" in data_var:
        fill_value = values.max()
        values = np.ma.masked_equal(values, fill_value)
    return core._tile({
        "longitude": lons,
        "latitude": lats,
        "values": values,
        "units": units
    }, z, x, y)


def convert_ms(dim, value):
    if "time" in dim.lower():
        if isinstance(value, str):
            return value
        else:
            return dt.datetime.fromtimestamp(value / 1000)
    else:
        return value
