import os
import uvicorn
import fastapi
from fastapi import Response
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse


app = fastapi.FastAPI()
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def root():
    return FileResponse(os.path.join(static_dir, "index.html"))


@app.get("/hello")
async def endpoint(response: Response):
    response.headers["Cache-Control"] = "max-age=31536000"
    return {"message": "Hello, Fetch API!"}


def main():
    uvicorn.run("main:app")


if __name__ == '__main__':
    main()
