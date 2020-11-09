"""
Nearcast driver
"""
import datetime as dt
import os
import glob
import re
import string
from functools import lru_cache
from forest_lite.server.inject import Use
from forest_lite.server.drivers.base import BaseDriver
from pydantic import BaseModel
from typing import Dict, List
import pygrib as pg


class Settings(BaseModel):
    pattern: str


class PointsAttrs(BaseModel):
    units: str = ""


class Points(BaseModel):
    data_var: str
    dim_name: str
    data: list
    attrs: PointsAttrs


class DataVarAttrs(BaseModel):
    units: str = ""
    long_name: str = ""


class Datavar(BaseModel):
    dims: List[str] = []
    attrs: DataVarAttrs


class Description(BaseModel):
    attrs: Dict[str, str]
    data_vars: Dict[str, Datavar]


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
def nearcast_description(file_names=Use(get_file_names)):
    items = get_data_vars(sorted(file_names)[-1])
    return Description(**{
        "attrs": {
            "product": "Nearcast",
            "reference": "CIMSS, University Wisconsin-Madison"
        },
        "data_vars": {
            item["name"]: {
                "dims": ["time", "level"],
                "attrs": {
                    "long_name": item["name"],
                    "units": item["units"],
                }
            } for item in items
        }
    })


@lru_cache
def get_data_vars(path):
    items = []
    messages = pg.open(path)
    for message in messages.select():
        items.append({
            "name": message['name'],
            "units": message['units']
        })
    messages.close()
    return items


@driver.override("points")
def nearcast_points(data_var, dim_name,
                    file_names=Use(get_file_names)):
    path = sorted(file_names)[-1]
    if dim_name == "level":
        data = sorted(set(get_first_fixed_surface(path, data_var)))
        units = "Pa"
    else:
        data = sorted(set(get_validity(path, data_var)))
        units = ""
    return Points(
        data_var=data_var,
        dim_name=dim_name,
        data=data,
        attrs={
            "units": units
        }
    ).dict()


@driver.override("tilable")
def nearcast_tilable(data_var, timestamp_ms, file_names=Use(get_file_names)):
    path = sorted(file_names)[-1]
    return get_grib2_data(path, timestamp_ms, data_var)


@lru_cache
def get_grib2_data(path, timestamp_ms, variable):
    valid_time = dt.datetime.fromtimestamp(timestamp_ms / 1000.)
    cache = {}
    messages = pg.index(path,
                        "name",
                        "scaledValueOfFirstFixedSurface",
                        "validityTime")
    if len(path) > 0:
        levels = sorted(set(get_first_fixed_surface(path, variable)))
        level = levels[0]
        times = sorted(set(get_validity(path, variable)))
        time = times[0]
        vTime = "{0:d}{1:02d}".format(time.hour, time.minute)
        field = messages.select(
            name=variable,
            scaledValueOfFirstFixedSurface=int(level),
            validityTime=vTime)[0]
        cache["longitude"] = field.latlons()[1][0,:]
        cache["latitude"] = field.latlons()[0][:,0]
        cache["values"] = field.values
        cache["units"] = field.units
        scaledLowerLevel = float(field.scaledValueOfFirstFixedSurface)
        scaleFactorLowerLevel = float(field.scaleFactorOfFirstFixedSurface)
        lowerSigmaLevel = str(round(scaledLowerLevel * 10**-scaleFactorLowerLevel, 2))
        scaledUpperLevel = float(field.scaledValueOfSecondFixedSurface)
        scaleFactorUpperLevel = float(field.scaleFactorOfSecondFixedSurface)
        upperSigmaLevel = str(round(scaledUpperLevel * 10**-scaleFactorUpperLevel, 2))
        cache['layer'] = lowerSigmaLevel+"-"+upperSigmaLevel
    messages.close()
    return cache


def get_first_fixed_surface(path, variable):
    messages = pg.index(path, "name")
    try:
        for message in messages.select(name=variable):
            yield message["scaledValueOfFirstFixedSurface"]
    except ValueError:
        # messages.select(name=variable) raises ValueError if not found
        pass
    messages.close()


def get_validity(path, variable):
    messages = pg.index(path, "name")
    try:
        for message in messages.select(name=variable):
            validTime = "{0:8d}{1:04d}".format(message["validityDate"],
                                               message["validityTime"])
            yield dt.datetime.strptime(validTime, "%Y%m%d%H%M")
    except ValueError:
        # messages.select(name=variable) raises ValueError if not found
        pass
    messages.close()
