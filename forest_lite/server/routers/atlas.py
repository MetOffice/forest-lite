from fastapi import APIRouter, Response, Query
from forest_lite.server.lib.atlas import load_feature
from bokeh.core.json_encoder import serialize_json


router = APIRouter()


@router.get("/natural_earth_feature")
async def links():
    resources = [
        ("physical", [
            "coastline",
            "lakes"
        ]),
        ("cultural", [
            "admin_0_boundary_lines_land",
            "admin_0_boundary_lines_disputed_areas"
        ]),
    ]
    links = {}
    for name, categories in resources:
        links[name] = {}
        for category in categories:
            links[name][category] = link(name, category)
    return {
        "links": links
    }


def link(category, name):
    return f"/natural_earth_feature/{category}/{name}"


@router.get("/natural_earth_feature/{category}/{name}")
async def natural_earth_feature(category: str,
                        name: str,
                        scale: str = "110m",
                        minlat: float = -90,
                        minlon: float = -180,
                        maxlat: float = 90,
                        maxlon: float = 180):
    extent = (minlon, maxlon, minlat, maxlat)
    obj = load_feature(category, name, scale, extent)
    content = serialize_json(obj)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response
