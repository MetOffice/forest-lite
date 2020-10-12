import glob
import xarray
from forest_lite.lib import core


class Driver:
    def __init__(self, name, settings):
        self.name = name
        self.settings = settings

    def data_tile(self, data_var, timestamp_ms, z, x, y):
        pattern = self.settings["pattern"]
        return core.get_data_tile(pattern, data_var, timestamp_ms, z, x, y)

    def get_times(self, limit):
        pattern = self.settings["pattern"]
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
        pattern = self.settings["pattern"]
        paths = sorted(glob.glob(pattern))
        if len(paths) > 0:
            path = paths[-1]
            with xarray.open_dataset(path, engine="h5netcdf") as nc:
                data = nc.to_dict(data=False)
            return data
        else:
            return {}
