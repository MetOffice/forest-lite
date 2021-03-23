"""
Nearcast driver
"""
from enum import Enum
import datetime as dt
import numpy as np
import os
import re
from functools import lru_cache
from forest_lite.server.util import get_file_names
from forest_lite.server.drivers.base import BaseDriver
from forest_lite.server.drivers.types import Description, Points, PointsAttrs
from pydantic import BaseModel
import pygrib as pg
import pytz


# Universal time coordinate
UTC = pytz.timezone("utc")


# Nearcast dataset dimension keywords
DIMENSION = Enum(
    value="Dimension",
    names=[
        ("start_time", 1),
        ("time", 2),
        ("level", 3)
    ]
)


class NearcastFile(BaseModel):
    path: str
    timestamp: dt.datetime


def nearcast_file(path):
    return NearcastFile(path=path, timestamp=parse_date(path))


def find_nearest(paths, date: dt.datetime):
    """Find path nearest to time from timestamp in file name"""
    distances = [distance(parse_date(path), date) for path in paths]
    idx = np.argmin(distances)
    return nearcast_file(paths[idx])


def distance(t0, t1):
    return abs((t0 - t1).total_seconds())


class Settings(BaseModel):
    pattern: str


class Query(BaseModel):
    start_time: dt.datetime


class TileQuery(BaseModel):
    start_time: dt.datetime = None
    time: dt.datetime
    level: int = None


driver = BaseDriver()


# TODO: Add file name date information into a dimension
def parse_date(path):
    """Parse datetime from file name"""
    groups = re.search("[0-9]{8}_[0-9]{4}", os.path.basename(path))
    if groups is not None:
        return (dt.datetime.strptime(groups[0], "%Y%m%d_%H%M")
                           .replace(tzinfo=UTC))


@driver.override("description")
def nearcast_description(settings):
    file_names = get_file_names(settings["pattern"])
    items = get_data_vars(sorted(file_names)[-1])
    return Description(**{
        "attrs": {
            "product": "Nearcast",
            "reference": "CIMSS, University Wisconsin-Madison"
        },
        "data_vars": {
            item["name"]: {
                "dims": [
                    DIMENSION.start_time.name,
                    DIMENSION.time.name,
                    DIMENSION.level.name,
                ],
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
def nearcast_points(settings: Settings, data_var: str, dim_name: str,
                    query=None):
    """Dimension values

    :returns: JSON representation of coordinate
    """

    if isinstance(settings, dict):
        settings = Settings(**settings)

    if isinstance(query, dict):
        query = Query(**query)

    file_names = get_file_names(settings.pattern)

    # Support dimensions
    if DIMENSION[dim_name] == DIMENSION.start_time:
        dates = []
        for path in file_names:
            date = parse_date(path)
            if date is None:
                dates.append(dt.datetime(1970, 1, 1))
            else:
                dates.append(date)
        data = list(sorted(set(dates)))[-100:]  # TODO: support 100+ dates in UI
        attrs = PointsAttrs(standard_name="time")

    elif DIMENSION[dim_name] == DIMENSION.level:
        path = sorted(file_names)[-1]  # TODO: replace with actual search
        data = sorted(set(get_first_fixed_surface(path, data_var)))
        attrs = PointsAttrs(standard_name="pressure", units="Pa")

    elif DIMENSION[dim_name] == DIMENSION.time:
        if query is None:
            # Most recent file time axis if no query specified
            path = sorted(file_names)[-1]
        else:
            path = find_nearest(file_names, query.start_time).path

        data = sorted(set(get_validity(path, data_var)))
        attrs = PointsAttrs(standard_name="time")

    else:
        raise Exception(f"unknown dim_name: {dim_name}")

    # Format response
    return Points(
        data_var=data_var,
        dim_name=dim_name,
        data=data,
        attrs=attrs,
    ).dict()


@driver.override("tilable")
def nearcast_tilable(settings, data_var, query: TileQuery = None):
    if isinstance(query, dict):
        query = TileQuery(**query)

    file_names = get_file_names(settings["pattern"])
    timestamp_s = query.time.timestamp()
    path = sorted(file_names)[-1]
    return get_grib2_data(path, timestamp_s, data_var)


@lru_cache
def get_grib2_data(path, timestamp_s, variable):
    time = dt.datetime.fromtimestamp(timestamp_s)
    cache = {}
    messages = pg.index(path,
                        "name",
                        "scaledValueOfFirstFixedSurface",
                        "validityTime")
    if len(path) > 0:
        levels = sorted(set(get_first_fixed_surface(path, variable)))
        level = levels[0]  # TODO: Fix this
        vTime = "{0:d}{1:02d}".format(time.hour, time.minute)
        field = messages.select(
            name=variable,
            scaledValueOfFirstFixedSurface=int(level),
            validityTime=int(vTime))[0]
        cache["longitude"] = field.latlons()[1][0, :]
        cache["latitude"] = field.latlons()[0][:, 0]
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
            yield (dt.datetime.strptime(validTime, "%Y%m%d%H%M")
                              .replace(tzinfo=UTC))
    except ValueError:
        # messages.select(name=variable) raises ValueError if not found
        pass
    messages.close()
