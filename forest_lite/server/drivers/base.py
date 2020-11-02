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
            "longitude": [],
            "latitude": [],
            "values": [],
        }

    def description(self):
        return {}
