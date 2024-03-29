
<p align="center">
<img src="https://raw.githubusercontent.com/MetOffice/forest-lite/master/logo.svg"
        width="350px" align="center" alt="FOREST-lite">
</p>

# FOREST Lite

Minimal implementation of FOREST. It uses [FastAPI](https://fastapi.tiangolo.com/) to expose data via
a REST API. The client application uses [Redux](https://redux.js.org/) and [React](https://reactjs.org/) to manage
state and components. For visualisation, [BokehJS](https://docs.bokeh.org/en/latest/docs/dev_guide/bokehjs.html)
and [Turf.js](https://turfjs.org/) have been chosen for their composability and ease-of-use.

## Prior art

If you haven't already, please take a look at [FOREST](https://github.com/MetOffice/forest) which is the original solution
that this implementation is attempting to optimize.

## Getting started

To start the FastAPI server run a command similar to the following

```sh
CONFIG_FILE=config.yaml python ${REPO_DIR}/server/main.py --port 8080
```

Then navigate to `localhost:8080` to view the application.

## Build

For simplicity the repository ships with pre-built assets, e.g. `static/lite.min.js`. Apart from the Python dependencies found in `requirements.txt` the app should just work out of the box.

For developers working on the client-side code, the project uses `npm` and `webpack` to create the bundled JS and other assets. `jest` is the preferred test framework.

## Documentation

Full documentation is available at [https://metoffice.github.io/forest-lite/](https://metoffice.github.io/forest-lite/)

## Configuration

The specification for config files has not yet been formalised but
for now it takes lessons learned from the [FOREST](https://github.com/MetOffice/forest) project

```yaml
datasets:
  - label: Satellite outgoing longwave radiation
    palettes:
      default:
        name: Greys
        number: 256
        reverse: true
    driver:
      name: eida50
      settings:
        pattern: path/to/EIDA50_*.nc
        data_vars:
          - data
```

**Note:** This schema may change in future releases

## REST API

Since the backend is powered by FastAPI to view the API Swagger documentation visit the `/docs` endpoint, e.g. `localhost:8080/docs`.

**Note:** For simplicity `/` serves `index.html`. Future releases may decouple the API server from the front-end server thus enabling independent scaling and a discoverable API
