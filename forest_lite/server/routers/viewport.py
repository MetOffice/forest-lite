from fastapi import APIRouter, Depends
from forest_lite.server import config


router = APIRouter()


@router.get("/viewport")
async def viewport(settings: config.Settings = Depends(config.get_settings)):
    return settings.viewport
