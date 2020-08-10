import os
import uvicorn
import fastapi
from fastapi import Response, Request
from fastapi.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates


app = fastapi.FastAPI()
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

templates_dir = os.path.join(os.path.dirname(__file__), "templates")
templates = Jinja2Templates(directory=templates_dir)


@app.get("/")
async def root(request: Request):
    settings = {"request": request, "title": "Hello, TemplateResponse!"}
    return templates.TemplateResponse("index.html", settings)


@app.get("/hello")
async def endpoint(response: Response):
    response.headers["Cache-Control"] = "max-age=31536000"
    return {"message": "Hello, Fetch API!"}


def main():
    uvicorn.run("main:app")


if __name__ == '__main__':
    main()
