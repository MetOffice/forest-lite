import glob
import xarray


class Driver:
    def __init__(self, name, settings):
        self.name = name
        self.settings = settings

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
