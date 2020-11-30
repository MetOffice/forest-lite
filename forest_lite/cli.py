import typer
import uvicorn
import forest_lite.server.main as _main
from forest_lite.server import config, user_db


app = typer.Typer()


def get_settings(file_name, driver_name, palette):
    def fn():
        return config.Settings(datasets=[
            {
                "label": file_name,
                "palettes": {
                    "default": {
                        "name": palette,
                        "number": 256,
                        "reverse": True,
                        "low": 200,
                        "high": 300
                    }
                },
                "driver": {
                    "name": driver_name,
                    "settings": {
                        "pattern": file_name
                    }
                }
            }
        ])
    return fn


@app.command()
def view(file_name: str, driver: str = "eida50", open_tab: bool = True,
         palette: str = "Viridis"):
    """
    FOREST Lite viewer

    A simplified interface to the FOREST Lite server tool
    """
    if open_tab:
        import threading
        import webbrowser
        url = "http://localhost:1234"
        print(f"opening browser: {url}")
        thread = threading.Thread(target=webbrowser.open, args=(url,))
        thread.start()

    callback = get_settings(file_name, driver, palette)
    _main.app.dependency_overrides[config.get_settings] = callback
    uvicorn.run(_main.app, port=1234)


@app.command()
def database(user_name: str, password: str, db_file: str,
             user_group: str = "anonymous"):
    print(f"save: {user_name} to {db_file}")
    user_db.save_user(user_name, password, db_file,
                      user_group=user_group)
