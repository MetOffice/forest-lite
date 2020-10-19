import typer
import uvicorn
import forest_lite.server.main as _main
from forest_lite.server import config


app = typer.Typer()


def get_settings():
    print("Command line settings")
    raise Exception


@app.command()
def main(file_name: str):
    """
    FOREST Lite viewer

    A simplified interface to the FOREST Lite server tool
    """
    _main.app.dependency_overrides[config.get_settings] = get_settings
    uvicorn.run(_main.app, port=1234)
