from fastapi import APIRouter, Response
from forest_lite.server.lib.atlas import load_feature
from bokeh.core.json_encoder import serialize_json


router = APIRouter()


@router.get("/atlas/{feature}")
async def atlas_feature(feature: str):
    obj = load_feature(feature)
    content = serialize_json(obj)
    response = Response(content=content,
                        media_type="application/json")
    #  response.headers["Cache-Control"] = "max-age=31536000"
    return response
