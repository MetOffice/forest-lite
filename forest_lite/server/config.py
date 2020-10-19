import os
from functools import lru_cache
import yaml
from forest_lite.server.lib.config import Config


Settings = Config  # TODO: Remove alias


@lru_cache
def get_settings():
    path = os.getenv("CONFIG_FILE")
    with open(path) as stream:
        data = yaml.safe_load(stream)
    return Config(**data)
