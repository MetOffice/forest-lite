from pydantic import BaseSettings
from functools import lru_cache
import yaml
import lib.config


@lru_cache
def get_settings():
    return Settings()


@lru_cache
def load_config(path):
    with open(path) as stream:
        data = yaml.safe_load(stream)
    return lib.config.Config(**data)


class Settings(BaseSettings):
    config_file: str
