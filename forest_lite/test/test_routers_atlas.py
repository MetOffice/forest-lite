import pytest
from fastapi.testclient import TestClient
from forest_lite.server import main
from forest_lite.server.routers import atlas


client = TestClient(main.app)


@pytest.mark.parametrize("scale,expect", [
    pytest.param("110m", 137, id="low-res"),
    pytest.param("50m", 1429, id="medium-res"),
    pytest.param("10m", 4133, id="high-res")
])
def test_coastlines_scale(scale, expect):
    response = client.get(f"/atlas/coastlines?scale={scale}")
    result = response.json()
    assert len(result["xs"]) == expect


def test_coastlines_no_args():
    response = client.get(f"/atlas/coastlines")
    result = response.json()
    assert len(result["xs"]) == 137


def test_coastlines_intersecting_geometries():
    url = "/atlas/coastlines?minlon=0&minlat=0&maxlon=10&maxlat=10"
    response = client.get(url)
    result = response.json()
    assert len(result["xs"]) == 2
