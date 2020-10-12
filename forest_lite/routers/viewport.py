from fastapi import APIRouter, Depends
from forest_lite import config


router = APIRouter()


@router.get("/viewport")
async def viewport(settings: config.Settings = Depends(config.get_settings)):
    data = config.load_config(settings.config_file)
    return data.viewport
