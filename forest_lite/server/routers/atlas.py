from fastapi import APIRouter, Response, Query
from forest_lite.server.lib.atlas import load_feature
from bokeh.core.json_encoder import serialize_json
from pydantic import BaseModel
from enum import Enum


class Feature(str, Enum):
    coastlines = "coastlines"
    lakes = "lakes"
    borders = "borders"
    disputed = "disputed"


router = APIRouter()


@router.get("/atlas/{feature}")
async def atlas_feature(feature: Feature,
                        scale: str = "110m",
                        minlat: float = -90,
                        minlon: float = -180,
                        maxlat: float = 90,
                        maxlon: float = 180):
    extent = (minlon, maxlon, minlat, maxlat)
    obj = load_feature(feature, scale, extent)
    content = serialize_json(obj)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response
