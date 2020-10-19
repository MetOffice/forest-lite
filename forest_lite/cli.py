import typer
import xarray
import forest_lite.server.main


app = typer.Typer()


@app.command()
def main(file_name: str):
    """
    FOREST Lite viewer

    A simplified interface to the FOREST Lite server tool
    """
    dataset = xarray.open_dataset(file_name)
    print(dataset)
