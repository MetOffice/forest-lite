import typer
import uvicorn
import forest_lite.server.main as _main
from forest_lite.server import config


app = typer.Typer()


def get_settings(file_name):
    def fn():
        return config.Settings(datasets=[
            {
                "label": file_name,
                "palettes": {
                    "default": {
                        "name": "Oranges",
                        "number": 256
                    }
                },
                "driver": {
                    "name": "eida50",
                    "settings": {
                        "pattern": file_name
                    }
                }
            }
        ])
    return fn


@app.command()
def main(file_name: str):
    """
    FOREST Lite viewer

    A simplified interface to the FOREST Lite server tool
    """
    callback = get_settings(file_name)
    _main.app.dependency_overrides[config.get_settings] = callback
    uvicorn.run(_main.app, port=1234)
