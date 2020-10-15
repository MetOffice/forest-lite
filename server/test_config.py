import lib.config


def test_config_object():
    config = lib.config.Config.from_dict({
        "datasets": [{"label": "Name"}]
    })
    assert config.datasets == [lib.config.Dataset(label="Name")]


def test_config_dataset():
    dataset = lib.config.Dataset(label="Label",
                                 driver={"name": "EIDA50", "settings": {}})
    assert dataset.label == "Label"
    assert dataset.driver == lib.config.Driver(name="EIDA50", settings={})
