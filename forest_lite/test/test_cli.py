from forest_lite import cli


def test_get_settings():
    file_name = "foo"
    driver_name = "bar"
    get_settings = cli.get_settings(file_name, driver_name)
    actual = get_settings()

    # Default CLI config
    assert actual.viewport.dict() == {
        "longitude": [-180, 180],
        "latitude": [-85, 85]
    }
    assert actual.datasets[0].driver.dict() == {
        "name": driver_name,
        "settings": {
            "pattern": file_name
        }
    }
