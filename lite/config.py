from pydantic import BaseSettings


class Settings(BaseSettings):
    config_file: str
