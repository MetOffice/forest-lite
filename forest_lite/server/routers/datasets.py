import inspect
from fastapi import APIRouter, Response, Depends
from forest_lite.server import drivers
from forest_lite.server.lib import core
from bokeh.core.json_encoder import serialize_json
import numpy as np
from forest_lite.server import config
from typing import Optional
import urllib.parse
from forest_lite.server.config import Settings, get_settings


router = APIRouter()


async def get_datasets(settings: Settings = Depends(get_settings)):
    """Datasets by user"""
    return [dataset for dataset in settings.datasets]


def has_access(dataset, user):
    """Check user has access to a particular dataset"""
    if dataset.user_groups is None:
        return True
    return user.group in dataset.user_groups


@router.get("/datasets")
async def datasets(response: Response,
                   _datasets = Depends(get_datasets)):
    # response.headers["Cache-Control"] = "max-age=31536000"
    return {"datasets": [{"label": dataset.label,
                          "driver": dataset.driver.name,
                          "view": dataset.view,
                          "id": dataset.uid,
                          "links": links(dataset.uid)
                          }
                 for dataset in _datasets]}


def links(dataset_id):
    """Endpoints related to a dataset id"""
    return {
        "data_vars": f"/datasets/{dataset_id}",
        "palette": f"/datasets/{dataset_id}/palette"
    }


def by_id(datasets, uid):
    for dataset in datasets:
        if dataset.uid == uid:
            return dataset


@router.get("/datasets/{dataset_id}/{data_var}/tiles/{Z}/{X}/{Y}")
async def data_tiles(dataset_id: int,
                     data_var: str,
                     Z: int, X: int, Y: int,
                     query: Optional[str] = None,
                     settings: config.Settings = Depends(config.get_settings)):
    """GET data tile from dataset at particular time"""
    dataset = by_id(settings.datasets, dataset_id)
    driver = drivers.from_spec(dataset.driver)
    settings = dataset.driver.settings

    # Support async methods
    obj_or_coroutine = driver.data_tile(settings, data_var, Z, X, Y, query=query)

    if inspect.iscoroutine(obj_or_coroutine):
        obj = await obj_or_coroutine
    else:
        obj = obj_or_coroutine

    content = serialize_json(obj)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response


@router.get("/datasets/{dataset_id}")
async def description(dataset_id: int,
                      settings: config.Settings = Depends(config.get_settings)):
    dataset = by_id(settings.datasets, dataset_id)
    driver = drivers.from_spec(dataset.driver)

    # Support async methods
    data_or_coroutine = driver.description(dataset.driver.settings)
    if inspect.iscoroutine(data_or_coroutine):
        data = await data_or_coroutine
    else:
        data = data_or_coroutine

    if not isinstance(data, dict):
        data = data.dict()
    data["dataset_id"] = dataset_id

    # Add links to discover axis information
    data["links"] = {}
    data["links"]["coords"] = coords_links(dataset_id, data)
    data["links"]["tiles"] = tiles_links(dataset_id, data)
    return data


def coords_links(dataset_id, data):
    result = {}
    for data_var, desc in data.get("data_vars", {}).items():
        for dim_name in desc.get("dims", []):
            uri = axis_link(dataset_id, data_var, dim_name)
            if data_var in result:
                result[data_var][dim_name] = uri
            else:
                result[data_var] = {dim_name: uri}
    return result


def axis_link(dataset_id, data_var, dim_name):
    """Link for a dimension endpoint"""
    endpoint = f"/datasets/{dataset_id}/{data_var}/axis/{dim_name}"
    return urllib.parse.quote(endpoint)


def tiles_links(dataset_id, data):
    """Generate nested links structure for tile endpoints"""
    data_vars = data.get("data_vars", {}).keys()
    return {data_var: tile_link(dataset_id, data_var)
            for data_var in data_vars}


def tile_link(dataset_id, data_var):
    """Link prefix for a tile endpoint"""
    endpoint = f"/datasets/{dataset_id}/{data_var}/tiles"
    return urllib.parse.quote(endpoint)


@router.get("/datasets/{dataset_id}/times/{timestamp_ms}/geojson")
async def geojson(dataset_id: int,
                  timestamp_ms: int,
                  settings: config.Settings = Depends(config.get_settings)):
    dataset = by_id(settings.datasets, dataset_id)
    driver = drivers.from_spec(dataset.driver)
    content = driver.get_geojson(timestamp_ms)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response


@router.get("/datasets/{dataset_id}/times/{timestamp_ms}/points")
async def points(dataset_id: int, timestamp_ms: int,
                 settings: config.Settings = Depends(config.get_settings)):
    time = np.datetime64(timestamp_ms, 'ms')
    dataset = by_id(settings.datasets, dataset_id)
    dataset_name = dataset.label
    path = core.get_path(settings, dataset_name)
    obj = core.get_points(path, time)
    content = serialize_json(obj)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response


@router.get("/datasets/{dataset_id}/palette")
async def palette(dataset_id: int,
                  settings: config.Settings = Depends(config.get_settings)):
    """Color palettes related to data variables in a dataset

    :returns: dataset.palettes
    """
    dataset = by_id(settings.datasets, dataset_id)
    return dataset.palettes


@router.get("/datasets/{dataset_id}/{data_var}/axis/{dim_name}")
async def axis(dataset_id: int,
               data_var: str,
               dim_name: str,
               query: Optional[str] = None,
               settings: config.Settings = Depends(config.get_settings)):
    """GET dimension values related to particular data_var"""
    dataset = by_id(settings.datasets, dataset_id)
    driver = drivers.from_spec(dataset.driver)
    settings = dataset.driver.settings

    # Support async methods
    obj_or_coroutine = driver.points(settings, data_var, dim_name, query=query)
    if inspect.iscoroutine(obj_or_coroutine):
        obj = await obj_or_coroutine
    else:
        obj = obj_or_coroutine

    content = serialize_json(obj)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response
