import argparse
import glob
import os
import numpy as np
import uvicorn
import fastapi
from fastapi import Depends, Response, Request
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
import config


app = fastapi.FastAPI()
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

templates_dir = os.path.join(os.path.dirname(__file__), "templates")
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
    context = {"request": request,
               "title": "FOREST lite"}
    return templates.TemplateResponse("index.html", context)


@app.get("/datasets")
async def datasets(response: Response,
                   settings: config.Settings = Depends(get_settings)):
    config = load_config(settings.config_file)
    response.headers["Cache-Control"] = "max-age=31536000"
    return {"datasets": [{"label": dataset.label, "id": i}
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
    for dataset in config.datasets:
        if dataset.label == dataset_name:
            pattern = dataset.driver.settings["pattern"]
            paths = sorted(glob.glob(pattern))
            if len(paths) > 0:
                obj = lib.core.get_times(dataset_name, paths[-1])[-limit:]
                content = serialize_json(obj)
                response = Response(content=content,
                                    media_type="application/json")
                #  response.headers["Cache-Control"] = "max-age=31536000"
                return response


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


@app.get("/points/{dataset}/{timestamp_ms}")
async def points(dataset: str, timestamp_ms: int,
                 settings: config.Settings = Depends(get_settings)):
    config = load_config(settings.config_file)
    time = np.datetime64(timestamp_ms, 'ms')
    path = lib.core.get_path(config, dataset)
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
