from pydantic import BaseSettings
from functools import lru_cache
import yaml
from forest_lite.server.lib.config import Config


@lru_cache
def get_settings():
    return Settings()


@lru_cache
def load_config(path):
    with open(path) as stream:
        data = yaml.safe_load(stream)
    return Config(**data)


class Settings(BaseSettings):
    config_file: str
