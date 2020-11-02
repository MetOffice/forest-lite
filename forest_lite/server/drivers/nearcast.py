"""
Nearcast driver
"""
import datetime as dt
import os
import glob
import re
import string
from forest_lite.server.inject import Use
from forest_lite.server.drivers.base import BaseDriver
from pydantic import BaseModel


class Settings(BaseModel):
    pattern: str


driver = BaseDriver()


def get_file_names():
    """Search disk for Nearcast files"""
    pattern = Settings(**driver.settings).pattern
    wildcard = string.Template(pattern).substitute(**os.environ)
    return sorted(glob.glob(wildcard))


def get_times():
    return sorted(parse_date(path) for path in get_file_names())


def parse_date(path):
    """Parse datetime from file name"""
    groups = re.search("[0-9]{8}_[0-9]{4}", os.path.basename(path))
    if groups is not None:
        return dt.datetime.strptime(groups[0], "%Y%m%d_%H%M")


@driver.override("get_times")
def nearcast_times(limits=None, times=Use(get_times)):
    return times[-limits:]


@driver.override("description")
def nearcast_description():
    return {
        "data_vars": {
            "variable": {}
        }
    }


@driver.override("tilable")
def nearcast_tilable(data_var, timestamp_ms):
    print(data_var, timestamp_ms)
    return {
        "longitude": [0, 1, 2],
        "latitude": [0, 1, 2],
        "values": [
            [0, 1, 2],
            [2, 3 ,4],
            [3, 4, 5]
        ],
        "units": ""
    }


def get_grib2_data(path, valid_time, variable, pressure):
    cache = {}

    validTime = dt.datetime.strptime(str(valid_time), "%Y-%m-%d %H:%M:%S")
    vTime = "{0:d}{1:02d}".format(validTime.hour, validTime.minute)

    messages = pg.index(path, "name", "scaledValueOfFirstFixedSurface", "validityTime")
    if len(path) > 0:
        field = messages.select(name=variable, scaledValueOfFirstFixedSurface=int(pressure), validityTime=vTime)[0]
        cache["longitude"] = field.latlons()[1][0,:]
        cache["latitude"] = field.latlons()[0][:,0]
        cache["data"] = field.values
        cache["units"] = field.units
        cache["name"] = field.name
        cache["valid"] = "{0:02d}:{1:02d} UTC".format(validTime.hour, validTime.minute)
        cache["initial"] = "blah"
        scaledLowerLevel = float(field.scaledValueOfFirstFixedSurface)
        scaleFactorLowerLevel = float(field.scaleFactorOfFirstFixedSurface)
        lowerSigmaLevel = str(round(scaledLowerLevel * 10**-scaleFactorLowerLevel, 2))
        scaledUpperLevel = float(field.scaledValueOfSecondFixedSurface)
        scaleFactorUpperLevel = float(field.scaleFactorOfSecondFixedSurface)
        upperSigmaLevel = str(round(scaledUpperLevel * 10**-scaleFactorUpperLevel, 2))
        cache['layer'] = lowerSigmaLevel+"-"+upperSigmaLevel
    messages.close()
    return cache
