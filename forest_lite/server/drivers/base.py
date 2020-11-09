import numpy as np
from forest_lite.server.lib import core
from forest_lite.server.inject import Injectable


class BaseDriver(Injectable):
    """Extendable interface"""
    def get_times(self, limit=None):
        return []

    def points(self, data_var, dim_name):
        """Coordinate/Dimension meta-data and values"""
        return []

    def data_tile(self, data_var, timestamp_ms, z, x, y,
                  constraints=None):
        tilable = self.tilable(data_var=data_var,
                               timestamp_ms=timestamp_ms,
                               constraints=constraints)
        return core._tile(tilable, z, x, y)

    def tilable(self, timestamp_ms, data_var):
        return {
            "longitude": [],
            "latitude": [],
            "values": np.empty((0, 0), dtype="f"),
            "units": ""
        }

    def description(self):
        return {}
