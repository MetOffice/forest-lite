from fastapi import APIRouter, Response, Depends
import lib.core
import lib.drivers
from bokeh.core.json_encoder import serialize_json
import numpy as np
import config


router = APIRouter()


@router.get("/datasets")
async def datasets(response: Response,
                   settings: config.Settings = Depends(config.get_settings)):
    config_obj = config.load_config(settings.config_file)
    # response.headers["Cache-Control"] = "max-age=31536000"
    return {"datasets": [{"label": dataset.label,
                          "driver": dataset.driver.name,
                          "id": i}
                         for i, dataset in enumerate(config_obj.datasets)]}


# TODO: Deprecate this endpoint
@router.get("/datasets/{dataset_name}/times/{time}")
async def datasets_images(dataset_name: str, time: int,
                          settings: config.Settings = Depends(config.get_settings)):
    config_obj = config.load_config(settings.config_file)
    for dataset in config_obj.datasets:
        if dataset.label == dataset_name:
            pattern = dataset.driver.settings["pattern"]
            paths = sorted(glob.glob(pattern))
            if len(paths) > 0:
                obj = lib.core.image_data(dataset_name,
                                          paths[-1],
                                          time)
                content = serialize_json(obj)
                response = Response(content=content,
                                    media_type="application/json")
                #  response.headers["Cache-Control"] = "max-age=31536000"
                return response


@router.get("/datasets/{dataset_name}/times")
async def dataset_times(dataset_name, limit: int = 10,
                        settings: config.Settings = Depends(config.get_settings)):
    config_obj = config.load_config(settings.config_file)
    datasets = list(find_datasets(config_obj, dataset_name))
    if len(datasets) == 0:
        raise Exception(f"{dataset_name} not found")
    spec = datasets[0].driver
    driver = lib.drivers.from_spec(spec)
    obj = driver.get_times(limit)
    content = serialize_json(obj)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response


def find_datasets(config_obj, label):
    for dataset in config_obj.datasets:
        if dataset.label == label:
            yield dataset


@router.get("/datasets/{dataset_id}/{data_var}/times/{timestamp_ms}/tiles/{Z}/{X}/{Y}")
async def data_tiles(dataset_id: int,
                     data_var: str,
                     timestamp_ms: int,
                     Z: int, X: int, Y: int,
                     settings: config.Settings = Depends(config.get_settings)):
    """GET data tile from dataset at particular time"""
    config_obj = config.load_config(settings.config_file)
    dataset = config_obj.datasets[dataset_id]
    driver = lib.drivers.from_spec(dataset.driver)
    data = driver.data_tile(data_var,
                            timestamp_ms,
                            Z, X, Y)
    obj = {
        "dataset_id": dataset_id,
        "timestamp_ms": timestamp_ms,
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
    config_obj = config.load_config(settings.config_file)
    dataset = config_obj.datasets[dataset_id]
    driver = lib.drivers.from_spec(dataset.driver)
    return driver.description()


@router.get("/datasets/{dataset_id}/times/{timestamp_ms}/geojson")
async def geojson(dataset_id: int,
                  timestamp_ms: int,
                  settings: config.Settings = Depends(config.get_settings)):
    config_obj = config.load_config(settings.config_file)
    dataset = config_obj.datasets[dataset_id]
    driver = lib.drivers.from_spec(dataset.driver)
    content = driver.get_geojson(timestamp_ms)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response


@router.get("/datasets/{dataset_id}/times/{timestamp_ms}/points")
async def points(dataset_id: int, timestamp_ms: int,
                 settings: config.Settings = Depends(config.get_settings)):
    config_obj = config.load_config(settings.config_file)
    time = np.datetime64(timestamp_ms, 'ms')
    dataset_name = config_obj.datasets[dataset_id].label
    path = lib.core.get_path(config_obj, dataset_name)
    obj = lib.core.get_points(path, time)
    content = serialize_json(obj)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response


@router.get("/datasets/{dataset_id}/palette")
async def palette(dataset_id: int,
                  settings: config.Settings = Depends(config.get_settings)):
    config_obj = config.load_config(settings.config_file)
    dataset = config_obj.datasets[dataset_id]
    return dataset.palettes
