from fastapi import APIRouter


router = APIRouter()


@router.get("/api")
async def api():
    """Discoverable API by hitting root endpoint"""
    return {
        "links": {
            "datasets": "/datasets",
            "natural_earth_feature": "/natural_earth_feature",
            "viewport": "/viewport"
        }
    }
