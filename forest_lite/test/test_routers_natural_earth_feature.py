import pytest
from pytest import param
from fastapi.testclient import TestClient
from forest_lite.server import main
from forest_lite.server.routers import atlas


client = TestClient(main.app)


@pytest.mark.parametrize("name,category,scale,expect", [
    param("physical", "coastline", "110m",
          137, id="coastline"),
    param("physical", "lakes", "110m",
          25, id="lakes"),
    param("cultural", "admin_0_boundary_lines_land", "110m",
          186, id="border"),
    param("cultural", "admin_0_boundary_lines_disputed_areas", "50m",
          24, id="disputed"),
])
def test_discoverable_api(name, category, scale, expect):
    """Explore links from /natural_earth_feature endpoint"""
    response = client.get("/api")
    url = response.json()["links"]["natural_earth_feature"]
    response = client.get(url)
    url = response.json()["links"][name][category]
    response = client.get(f"{url}?scale={scale}")
    result = response.json()
    assert len(result["xs"]) == expect


@pytest.mark.parametrize("scale,expect", [
    pytest.param("110m", 137, id="low-res"),
    pytest.param("50m", 1429, id="medium-res"),
    pytest.param("10m", 4133, id="high-res")
])
def test_coastlines_scale(scale, expect):
    url = f"/natural_earth_feature/physical/coastline?scale={scale}"
    response = client.get(url)
    result = response.json()
    assert len(result["xs"]) == expect


def test_coastlines_no_args():
    url = f"/natural_earth_feature/physical/coastline"
    response = client.get(url)
    result = response.json()
    assert len(result["xs"]) == 137


def test_coastlines_intersecting_geometries():
    url = "/natural_earth_feature/physical/coastline?minlon=0&minlat=0&maxlon=10&maxlat=10"
    response = client.get(url)
    result = response.json()
    assert len(result["xs"]) == 2
