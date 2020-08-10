import argparse
import glob
import os
import uvicorn
import fastapi
from fastapi import Response, Request
from fastapi.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
import bokeh.resources
import bokeh.palettes
from bokeh.core.json_encoder import serialize_json
import yaml
import lib.core
import lib.config
import lib.palette


app = fastapi.FastAPI()
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

templates_dir = os.path.join(os.path.dirname(__file__), "templates")
templates = Jinja2Templates(directory=templates_dir)


CONFIG = None  # TODO: Remove global variable


@app.on_event("startup")
async def startup_event():
    global CONFIG

    # Configure application
    args = parse_args()
    with open(args.config_file) as stream:
        data = yaml.safe_load(stream)
        CONFIG = lib.config.Config(**data)


@app.get("/")
async def root(request: Request):
    resources = bokeh.resources.Resources("cdn", minified=False)
    context = {"request": request,
               "title": "FOREST lite",
               "resources": resources.render(),
               "version": bokeh.__version__}
    return templates.TemplateResponse("index.html", context)


@app.get("/datasets")
async def datasets(response: Response):
    response.headers["Cache-Control"] = "max-age=31536000"
    return {"names": sorted(dataset.label for dataset in CONFIG.datasets)}


@app.get("/image/{dataset_name}")
async def image(dataset_name):
    for dataset in CONFIG.datasets:
        if dataset.label == dataset_name:
            pattern = dataset.driver.settings["pattern"]
            paths = sorted(glob.glob(pattern))
            if len(paths) > 0:
                obj = lib.core.image_data(dataset_name, paths[-1])
                content = serialize_json(obj)
                response = Response(content=content,
                                    media_type="application/json")
                response.headers["Cache-Control"] = "max-age=31536000"
                return response


@app.get("/palettes")
async def palettes():
    return list(lib.palette.all_palettes())


def parse_args():
    """Command line interface"""
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8888)
    parser.add_argument("config_file")
    return parser.parse_args()


def main():
    # Parse command line arguments
    args = parse_args()

    # Start server
    uvicorn.run("main:app", port=args.port)


if __name__ == '__main__':
    main()
