import os
import glob
import xarray
from forest_lite.server.lib import core
from pydantic import BaseModel, validator
from typing import List


class Settings(BaseModel):
    pattern: str
    data_vars: List[str] = None


    @validator("pattern")
    def expand_tilda(cls, v):
        return os.path.expanduser(v)


class Driver:
    def __init__(self, name, settings):
        self.name = name
        self.settings = Settings(**settings)

    def data_tile(self, data_var, timestamp_ms, z, x, y):
        pattern = self.settings.pattern
        return core.get_data_tile(pattern, data_var, timestamp_ms, z, x, y)

    def get_times(self, limit):
        pattern = self.settings.pattern
        paths = sorted(glob.glob(pattern))
        if len(paths) > 0:
            return self._times(paths[-1])[-limit:]
        else:
            return []

    def _times(self, path):
        with xarray.open_dataset(path, engine="h5netcdf") as nc:
            times = nc.time.values
        return times

    def description(self):
        pattern = self.settings.pattern
        paths = sorted(glob.glob(pattern))
        if len(paths) > 0:
            path = paths[-1]
            with xarray.open_dataset(path, engine="h5netcdf") as nc:
                data = nc.to_dict(data=False)
            # Filter data_vars
            if self.settings.data_vars is not None:
                data["data_vars"] = {
                    key: value for key, value in data["data_vars"].items()
                    if key in self.settings.data_vars
                }
            return data
        else:
            return {}