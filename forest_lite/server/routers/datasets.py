from fastapi import APIRouter, Response, Depends
from forest_lite.server import drivers
from forest_lite.server.lib import core
from bokeh.core.json_encoder import serialize_json
import numpy as np
from forest_lite.server import config
from typing import Optional
import json
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
                          "id": dataset.uid}
                 for dataset in _datasets]}


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
    if query is not None:
        query = json.loads(query)
    dataset = by_id(settings.datasets, dataset_id)
    driver = drivers.from_spec(dataset.driver)
    settings = dataset.driver.settings
    data = driver.data_tile(settings, data_var, Z, X, Y, query=query)
    obj = {
        "dataset_id": dataset_id,
        "tile": [X, Y, Z],
        "data": data
    }
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
    data = driver.description(dataset.driver.settings)
    if not isinstance(data, dict):
        data = data.dict()
    data["dataset_id"] = dataset_id
    return data



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
    dataset = by_id(settings.datasets, dataset_id)
    return dataset.palettes


@router.get("/datasets/{dataset_id}/{data_var}/axis/{dim_name}")
async def axis(dataset_id: int,
               data_var: str,
               dim_name: str,
               query: Optional[str] = None,
               settings: config.Settings = Depends(config.get_settings)):
    """GET dimension values related to particular data_var"""
    if query is not None:
        query = json.loads(query)
    dataset = by_id(settings.datasets, dataset_id)
    driver = drivers.from_spec(dataset.driver)
    settings = dataset.driver.settings
    obj = driver.points(settings, data_var, dim_name, query=query)
    content = serialize_json(obj)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response
