"""Simple RDT geoJSON driver"""
import re
import os
import glob
import datetime as dt
import numpy as np


DIRECTORY = "/scratch/frpf/HIGHWAY/RDT/json"
GLOB_PATTERN = "RDT_features_eastafrica_*.json"
FORMAT_PATTERN = "RDT_features_eastafrica_{:%Y%m%d%H%M}.json"


class Driver:
    def __init__(self, name, settings):
        self.name = name
        self.settings = settings

    # TODO: Migrate this to general coordinates
    def get_times(self, limit):
        paths = glob.glob(os.path.join(DIRECTORY, GLOB_PATTERN))
        times = [parse_time(path) for path in paths]
        return sorted(times)[-limit:]

    def get_geojson(self, timestamp_ms):
        time = np.datetime64(timestamp_ms, 'ms').astype('O')
        path = get_path(time)
        with open(path) as stream:
            content = stream.read()
        return content


def parse_time(path):
    regex = re.compile(r"[0-9]{12}")
    groups = regex.search(os.path.basename(path))
    if groups:
        return dt.datetime.strptime(groups[0], "%Y%m%d%H%M")


def get_path(time):
    return os.path.join(DIRECTORY, FORMAT_PATTERN.format(time))
