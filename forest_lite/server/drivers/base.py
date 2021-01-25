import numpy as np
from forest_lite.server.lib import core
from forest_lite.server.inject import Injectable


class BaseDriver(Injectable):
    """Extendable interface"""
    def get_times(self, limit=None):
        return []

    def points(self, settings, data_var, dim_name, query=None):
        """Coordinate/Dimension meta-data and values"""
        return []

    def data_tile(self, settings, data_var, z, x, y, query=None):
        tilable = self.tilable(settings, data_var, query=query)
        return core._tile(tilable, z, x, y)

    def tilable(self, settings, data_var, query=None):
        return {
            "longitude": [],
            "latitude": [],
            "values": np.empty((0, 0), dtype="f"),
            "units": ""
        }

    def description(self, settings):
        return {}
