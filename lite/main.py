import argparse
import os
import uvicorn
import fastapi
from fastapi import Response, Request
from fastapi.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
import bokeh.resources


app = fastapi.FastAPI()
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

templates_dir = os.path.join(os.path.dirname(__file__), "templates")
templates = Jinja2Templates(directory=templates_dir)


@app.get("/")
async def root(request: Request):
    resources = bokeh.resources.Resources("cdn", minified=False)
    context = {"request": request,
               "title": "FOREST lite",
               "resources": resources.render(),
               "version": bokeh.__version__}
    return templates.TemplateResponse("index.html", context)


@app.get("/hello")
async def endpoint(response: Response):
    response.headers["Cache-Control"] = "max-age=31536000"
    return {"message": "Hello, Fetch API!"}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8888)
    args = parser.parse_args()
    uvicorn.run("main:app", port=args.port)


if __name__ == '__main__':
    main()
