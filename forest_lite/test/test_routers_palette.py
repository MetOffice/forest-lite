from fastapi.testclient import TestClient
from forest_lite.server import main, config
from forest_lite.server.lib.config import Config
import pytest

client = TestClient(main.app)


def use_settings(props):
    """Override get_settings runtime dependency"""
    settings = Config(**props)
    main.app.dependency_overrides[config.get_settings] = lambda: settings


@pytest.mark.parametrize("dataset_id", [
    3, 7
])
def test_get_dataset_palette(dataset_id):
    """HTTP GET endpoint to map variable to colors/limits"""
    # Fake config
    var_name = "air_temperature"
    colors = ["#FFF", "#000"]
    lows = [0, 1, 1, 2, 3, 5, 8, 13, 21, 44]
    highs = [1, 2, 3, 5, 7, 11, 13, 17, 19, 23]
    use_settings({
        "datasets": [
            {
                "label": "Label",
                "palettes": {
                    var_name: {
                        "colors": colors,
                        "low": low,
                        "high": high
                    }
                }
            }
            for low, high in zip(lows, highs)
        ]
    })

    # System under test
    url = f"/datasets/{dataset_id}/palette"
    response = client.get(url)
    actual = response.json()

    # Assertions
    expected = {
        var_name: {
            "colors": colors,
            "low": lows[dataset_id],
            "high": highs[dataset_id]
        }
    }
    assert expected == actual
