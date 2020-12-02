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
def test_coastlines(scale, expect):
    response = client.get(f"/atlas/coastlines?scale={scale}")
    result = response.json()
    assert len(result["xs"]) == expect
