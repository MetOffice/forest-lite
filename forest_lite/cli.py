import typer
import uvicorn
import forest_lite.server.main as _main
from forest_lite.server import config, user_db


app = typer.Typer()


def scan_port(initial_port):
    """Helper to detect available port"""
    port = initial_port
    while in_use(port):
        print(f"port {port} already in use")
        port += 1
    print(f"port {port} available")
    return port


def in_use(port):
    """Check if port is accessible"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


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


def browser_thread(url):
    import threading
    import webbrowser
    print(f"opening browser: {url}")
    return threading.Thread(target=webbrowser.open, args=(url,))


@app.command()
def view(file_name: str, driver: str = "eida50", open_tab: bool = True,
         palette: str = "Viridis",
         port: int = 1234):
    """
    FOREST Lite viewer

    A simplified interface to the FOREST Lite server tool
    """
    port = scan_port(port)

    if open_tab:
        url = f"http://localhost:{port}"
        thread = browser_thread(url)
        thread.start()

    callback = get_settings(file_name, driver, palette)
    _main.app.dependency_overrides[config.get_settings] = callback
    uvicorn.run(_main.app, port=port)


@app.command()
def serve(config_file: str,
          open_tab: bool = True,
          port: int = 1234):
    """
    FOREST Lite server

    A simplified interface to uvicorn and configuration files
    used to serve the app
    """
    port = scan_port(port)

    def get_settings():
        import yaml
        with open(config_file) as stream:
            data = yaml.safe_load(stream)
        return config.Settings(**data)

    if open_tab:
        url = f"http://localhost:{port}"
        thread = browser_thread(url)
        thread.start()

    _main.app.dependency_overrides[config.get_settings] = get_settings
    uvicorn.run(_main.app, port=port)


@app.command()
def database(user_name: str, password: str, db_file: str,
             user_group: str = "anonymous"):
    print(f"save: {user_name} to {db_file}")
    user_db.save_user(user_name, password, db_file,
                      user_group=user_group)
