from fastapi import APIRouter
import lib.palette


router = APIRouter()


@router.get("/palettes")
async def palettes():
    return list(lib.palette.all_palettes())
