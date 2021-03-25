import typer

INFO = typer.style("INFO", fg=typer.colors.GREEN) + ":    "
HELP = typer.style("HELP", fg=typer.colors.BLUE) + ":    "
FAIL = typer.style("FAIL", fg=typer.colors.RED) + ":    "
SUCCESS = typer.style("SUCCESS", fg=typer.colors.BLUE) + ": "

typer.echo(f"{INFO} Importing modules, please wait")

import os
import uvicorn
import forest_lite.server.main as _main
from forest_lite.server import config


app = typer.Typer()


def scan_port(initial_port):
    """Helper to detect available port"""
    port = initial_port
    typer.echo(f"{INFO} Scanning ports")
    while in_use(port):
        typer.echo(f"{FAIL} Port {port} in use")
        port += 1
    typer.echo(f"{SUCCESS} Port {port} available")
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
    typer.echo(f"{INFO} Opening browser: {url}")
    return threading.Thread(target=webbrowser.open, args=(url,))


@app.command("open")  # NOTE open is a Python built-in
def open_cmd(file_name: str,
             driver: str = "iris",
             open_tab: bool = True,
             palette: str = "Viridis",
             port: int = 1234):
    """
    Explore a file.
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
def run(config_file: str,
        open_tab: bool = True,
        port: int = 1234):
    """
    Run a long-running instance with a config file.
    """
    if not os.path.exists(config_file):
        typer.echo(f"{FAIL} {config_file} not found on file system")
        if os.path.isabs(config_file):
            helper = f"{HELP} Looks like an absolute path, is there a typo?"
        else:
            helper = (f"{HELP} Looks like a relative path, "
                       "are you in the right directory?")
        typer.echo(helper)

        raise typer.Exit()

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
