from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


def test_tile_endpoint():
    response = client.get("/datasets/0/times/0/tiles/0/0/0")
    assert response.status_code == 200
    assert response.json() == {
        "dataset_id": 0,
        "timestamp_ms": 0,
        "tile": [0, 0, 0],
        "data": {
            "x": [],
            "y": [],
            "dw": [],
            "dh": [],
            "image": []
        }
    }
