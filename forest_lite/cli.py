import typer

INFO = typer.style("INFO", fg=typer.colors.GREEN) + ":    "
HELP = typer.style("HELP", fg=typer.colors.BLUE) + ":    "
FAIL = typer.style("FAIL", fg=typer.colors.RED) + ":    "
SUCCESS = typer.style("SUCCESS", fg=typer.colors.BLUE) + ": "


import click
import os
import yaml


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
        from forest_lite.server import config
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

    typer.echo(f"{INFO} Import modules")
    import uvicorn
    import forest_lite.server.main as _main
    from forest_lite.server import config

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

    # Launch FastAPI server
    typer.echo(f"{INFO} Import modules")
    import uvicorn
    import forest_lite.server.main as _main
    from forest_lite.server import config

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


# INIT sub-command

def palette_names(N=256):
    for key, palette in bokeh.palettes.all_palettes.items():
        if N in palette:
            yield key

def echo_heading(msg):
    typer.secho("\n" + msg, fg="blue")


@app.command()
def init(config_file: str ="config.yaml"):
    """
    Create a config file.
    """
    import bokeh.palettes

    data = {
        "datasets": [
        ],
    }

    # Introduction
    click.clear()
    typer.echo("\nWelcome to FOREST-Lite!")
    typer.echo("""
This tool will guide you through the additional configuration needed to
make best use of forest_lite.
""")
    typer.confirm("Are you ready to continue", abort=True)

    # Datasets
    echo_heading("Datasets")
    typer.echo("""
Datasets are collections of related data, e.g. a particular model run or
observation platform. They use drivers to find/load their data, multiple
datasets can share the same driver with different settings.
""")
    while True:
        echo_heading("Add a dataset")
        dataset = {"driver": {},
                   "palettes": {}}

        # Label
        response = typer.prompt("Please specify a label for your dataset",
                                default="MyDataset")
        dataset["label"] = response

        # Driver
        echo_heading("Driver")
        drivers = click.Choice(["iris", "xarray_h5netcdf"])
        driver_name = typer.prompt("Which driver would it use?",
                                   default="iris",
                                   type=drivers)
        dataset["driver"]["name"] = driver_name

        echo_heading("Driver setting(s)")
        typer.echo(f"""Drivers need to be configured before use.
You selected '{driver_name}'. I'll need some additional information to configure it.
""")
        settings = {}
        for key, description in [("pattern", "file system pattern")]:
            # Gather a key, value pair
            value = typer.prompt(f"Enter a {description}")
            settings[key] = value

        dataset["driver"]["settings"] = settings

        # ColorPalette
        echo_heading("Color palette")
        typer.echo(f"""Data needs color or at least a default palette.
""")
        palettes = click.Choice(sorted(palette_names()))
        name = typer.prompt("Which palette would it use?",
                            default="Viridis",
                            type=palettes)
        dataset["palettes"]["default"] = {
            "name": name,
            "number": 256
        }

        data["datasets"].append(dataset)

        # Ask to continue
        response = typer.confirm(f"Would you like to add another dataset?")
        if response:
            continue
        else:
            break

    # Confirm settings are correct
    echo_heading("Review")
    typer.echo("""
Please take a look at the configuration that has been generated
by your answers.
""")
    typer.echo(yaml.dump(data))
    typer.confirm("Are you happy with these settings?", abort=True)

    # Output configuration to file
    typer.secho(f"Writing configuration to '{config_file}'",
                fg="magenta")
    with open(config_file, "w") as stream:
        yaml.dump(data, stream)

    # Next steps
    echo_heading("Next steps")
    note = typer.style("Note:", bold=True)
    typer.echo(f"""
Congratulations! You have successfully generated a forest_lite
configuration. To try it out run the following command
""")
    typer.secho(f"forest_lite run {config_file}", fg="cyan")
    typer.echo(f"""
A browser tab should open with an app displaying your data.

{note} This tool provides a subset of functionality, use your favourite text editor
to continue crafting '{config_file}'.

""")
