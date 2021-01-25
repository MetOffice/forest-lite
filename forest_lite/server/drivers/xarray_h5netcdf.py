import os
import glob
import xarray
from forest_lite.server.drivers.base import BaseDriver
from forest_lite.server.lib import core
from pydantic import BaseModel, validator
from typing import List


class Settings(BaseModel):
    pattern: str
    data_vars: List[str] = None


    @validator("pattern")
    def expand_tilda(cls, v):
        return os.path.expanduser(v)


driver = BaseDriver()


@driver.override("data_tile")
def data_tile(settings, data_var, z, x, y, query=None):
    pattern = Settings(**settings).pattern
    return core.get_data_tile(pattern, data_var, z, x, y, query)


# TODO: Deprecate this endpoint
def get_times(self, limit):
    pattern = self.settings.pattern
    paths = sorted(glob.glob(pattern))
    if len(paths) > 0:
        return _times(paths[-1])[-limit:]
    else:
        return []

def _times(path):
    with xarray.open_dataset(path, engine="h5netcdf") as nc:
        times = nc.time.values
    return times


@driver.override("description")
def description(settings):
    settings = Settings(**settings)
    paths = sorted(glob.glob(settings.pattern))
    if len(paths) > 0:
        path = paths[-1]
        with xarray.open_dataset(path, engine="h5netcdf") as nc:
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
        with xarray.open_dataset(path, engine="h5netcdf") as nc:
            attrs = nc[dim_name].attrs
            data = nc[dim_name].values
    return {
        "data_var": data_var,
        "dim_name": dim_name,
        "data": data,
        "attrs": attrs
    }
