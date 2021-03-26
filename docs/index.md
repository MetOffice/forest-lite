# Introduction

FOREST - **F**orecast **O**bservation **R**esearch **E**xploration and **S**urvey **T**ool

Similar to it's bigger brother `forest`, `forest_lite` tries to minimize
the barrier to entry to displaying meteorological data.

## Open a file

To quickly display a single file use the `open` command. This
will start a server and open a browser tab with your data
on display.

```sh
forest_lite open ${name_of_file}
```

!!! note
    `forest_lite` uses the iris driver by default.
    For alternative drivers please use the `--driver` flag


## Dive in with init

Init is a helper program to bridge the
gap between using the `open` command and the full system `run`
command. Think of it as
a helpful assistant who can write your config file for you.

```sh
forest_lite init
```

Run the command and then follow the step-by-step on screen instructions
to generate a basic configuration file.


## Run a full system

FOREST-Lite is a configurable system that can interface with
arbitrary data sources. As long as there's a driver to connect
user events to snippets of data.

```sh
forest_lite run ${config_file}
```

!!! note
    Use `--no-open-tab` if running in a non-interactive environment

## Source code

FOREST Lite source code is available at [GitHub](https://github.com/MetOffice/forest-lite).

