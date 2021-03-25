from fastapi import APIRouter


router = APIRouter()


@router.get("/api")
async def api():
    """Discoverable API by hitting root endpoint"""
    return {
        "links": {
            "datasets": "/datasets",
            "viewport": "/viewport"
        }
    }
