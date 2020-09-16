# FOREST Lite

A lightweight FOREST (Forecast Observation Research Exploration and Survey Tool)

## Source code

FOREST Lite source code is available at [GitHub](https://github.com/MetOffice/forest-lite).

## Production environment

To keep things simple the production environment deploys
the API and client from the same server running on the same Docker container.

```sh
export BASE_URL=http://website.com  # No trailing /
export CONFIG_FILE=/some/config.yaml
python server/main.py --port ${CONTAINER_PORT}
```

When deploying behind a proxy server like NGINX or Traefik it
becomes a little difficult to reverse engineer `X-Forwarded...` headers
to create an appropriate `baseURL` to query the API. For convenience
`BASE_URL` specifies the browser address that users are likely to visit.

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
