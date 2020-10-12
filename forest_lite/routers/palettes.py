from fastapi import APIRouter
from forest_lite.lib import palette


router = APIRouter()


@router.get("/palettes")
async def palettes():
    return list(palette.all_palettes())
