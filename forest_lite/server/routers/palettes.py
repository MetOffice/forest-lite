from fastapi import APIRouter
from forest_lite.server.lib.palette import all_palettes


router = APIRouter()


@router.get("/palettes")
async def palettes():
    return list(all_palettes())
