import argparse
import os
import uvicorn
import fastapi
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
from starlette.responses import FileResponse
from forest_lite.routers import atlas, datasets, palettes, viewport


app = fastapi.FastAPI()
app.include_router(atlas.router)
app.include_router(datasets.router)
app.include_router(palettes.router)
app.include_router(viewport.router)


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
