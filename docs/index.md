# FOREST Lite

Placeholder for full documentation.

## Source code

FOREST Lite source code is available at [GitHub](https://github.com/MetOffice/forest-lite).


## Development environment

The most frictionless workflow takes advantage of auto-reloading and
re-compiling features in both `webpack-dev-server` and `uvicorn`.

### API server

To run FastAPI to reload on source change run the following command

```
export CONFIG_FILE=path/to/config.yaml
cd server/
uvicorn main:app --reload
```

### Client server

To start the client using `webpack-dev-server` run the following

```
npm run start
```
