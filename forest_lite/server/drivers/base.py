import numpy as np
from forest_lite.server.lib import core
from forest_lite.server.inject import Injectable


class BaseDriver(Injectable):
    """Extendable interface"""
    def get_times(self, limit=None):
        return []

    def data_tile(self, data_var, timestamp_ms, z, x, y):
        tilable = self.tilable(data_var=data_var, timestamp_ms=timestamp_ms)
        return core._tile(tilable, z, x, y)

    def tilable(self, timestamp_ms, data_var):
        return {
            "longitude": np.array([], dtype="f"),
            "latitude": np.array([], dtype="f"),
            "values": np.empty((0, 0), dtype="f"),
            "units": ""
        }

    def description(self):
        return {}
