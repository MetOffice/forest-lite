import argparse
import glob
import os
import numpy as np
import uvicorn
import fastapi
from fastapi import Depends, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
from starlette.responses import FileResponse
import bokeh.palettes
from bokeh.core.json_encoder import serialize_json
from functools import lru_cache
import yaml
import lib.core
import lib.config
import lib.palette
import lib.atlas
import lib.drivers
import config


app = fastapi.FastAPI()


# CORS
origins = [
    "*"  # TODO: Restrict origin to client only
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# /static assets
static_dir = os.path.join(os.path.dirname(__file__), "../client/static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")


# Templates
templates_dir = static_dir
templates = Jinja2Templates(directory=templates_dir)


@lru_cache
def get_settings():
    return config.Settings()


@lru_cache
def load_config(path):
    with open(path) as stream:
        data = yaml.safe_load(stream)
    return lib.config.Config(**data)


@app.get("/")
async def root(request: Request):
    host, port = request.scope.get("server")
    env_base_url = os.getenv("BASE_URL")
    if env_base_url:
        baseURL = env_base_url
    else:
        baseURL = str(request.url)[:-1]  # Remove trailing /
    print(request.headers)
    context = {"request": request,
               "baseURL": baseURL}
    return templates.TemplateResponse("index.html", context)


@app.get("/datasets")
async def datasets(response: Response,
                   settings: config.Settings = Depends(get_settings)):
    config = load_config(settings.config_file)
    # response.headers["Cache-Control"] = "max-age=31536000"
    return {"datasets": [{"label": dataset.label,
                          "driver": dataset.driver.name,
                          "id": i}
                         for i, dataset in enumerate(config.datasets)]}


@app.get("/datasets/{dataset_name}/times/{time}")
async def datasets_images(dataset_name: str, time: int,
                          settings: config.Settings = Depends(get_settings)):
    config = load_config(settings.config_file)
    for dataset in config.datasets:
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


@app.get("/palettes")
async def palettes():
    return list(lib.palette.all_palettes())


@app.get("/datasets/{dataset_name}/times")
async def dataset_times(dataset_name, limit: int = 10,
                        settings: config.Settings = Depends(get_settings)):
    config = load_config(settings.config_file)
    datasets = list(find_datasets(config, dataset_name))
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


def find_datasets(config, label):
    for dataset in config.datasets:
        if dataset.label == label:
            yield dataset


@app.get("/datasets/{dataset_id}/times/{timestamp_ms}/tiles/{Z}/{X}/{Y}")
async def data_tiles(dataset_id: int, timestamp_ms: int,
                     Z: int, X: int, Y: int,
                     settings: config.Settings = Depends(get_settings)):
    """GET data tile from dataset at particular time"""
    config = load_config(settings.config_file)
    dataset_name = config.datasets[dataset_id].label
    data = lib.core.get_data_tile(config, dataset_name, timestamp_ms, Z, X, Y)
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


@app.get("/datasets/{dataset_id}/times/{timestamp_ms}/geojson")
async def geojson(dataset_id: int,
                  timestamp_ms: int,
                  settings: config.Settings = Depends(get_settings)):
    config = load_config(settings.config_file)
    dataset = config.datasets[dataset_id]
    driver = lib.drivers.from_spec(dataset.driver)
    content = driver.get_geojson(timestamp_ms)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response


@app.get("/datasets/{dataset_id}/times/{timestamp_ms}/points")
async def points(dataset_id: int, timestamp_ms: int,
                 settings: config.Settings = Depends(get_settings)):
    config = load_config(settings.config_file)
    time = np.datetime64(timestamp_ms, 'ms')
    dataset_name = config.datasets[dataset_id].label
    path = lib.core.get_path(config, dataset_name)
    obj = lib.core.get_points(path, time)
    content = serialize_json(obj)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response


@app.get("/atlas/{feature}")
async def atlas_feature(feature: str):
    obj = lib.atlas.load_feature(feature)
    content = serialize_json(obj)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response


@app.get("/viewport")
async def viewport(settings: config.Settings = Depends(get_settings)):
    config = load_config(settings.config_file)
    return config.viewport


def parse_args():
    """Command line interface"""
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8888)
    return parser.parse_args()


def main():
    # Parse command line arguments
    args = parse_args()

    # Start server
    uvicorn.run("main:app", port=args.port)


if __name__ == '__main__':
    main()
