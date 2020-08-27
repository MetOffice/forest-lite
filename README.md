# FOREST-lite

Minimal implementation of FOREST. It uses FastAPI to expose data via
a REST API. The client application uses Redux and React to manage
state and components. For visualisation, BokehJS and Turf.js have
been chosen for their composability and ease-of-use.

## Getting started

To start the FastAPI server run a command similar to the following

```sh
CONFIG_FILE=config.yaml python ${REPO_DIR}/lite/main.py --port 8080
```

Then navigate to `localhost:8000` to view the application.

## Build

For simplicity, at present the repository ships with a built version `static/lite.min.js`.

For developers, the project uses `npm` and `webpack` to create the bundled JS and other assets.

## Configuration

The specification for config files has not yet been formalised but
for now it takes lessons learned from the FOREST project

```yaml
datasets:
  - label: EIDA50
    driver:
      name: eida50
      settings:
        pattern: path/to/EIDA50_*.nc
```

**Note:** This schema may change in future releases

