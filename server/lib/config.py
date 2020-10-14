"""Configuration parsing"""
from pydantic import BaseModel
from typing import List, Dict


class Viewport(BaseModel):
    """Map extents"""
    longitude: List[float] = [-180, 180]
    latitude: List[float] = [-85, 85]


class Driver(BaseModel):
    name: str = ""
    settings: dict = {}


class Palette(BaseModel):
    colors: List[str] = []
    low: float = 0
    high: float = 1


class Dataset(BaseModel):
    label: str
    driver: Driver = Driver()
    palette: dict = {}
    data_vars: Dict[str, Palette] = {}


class Config(BaseModel):
    viewport: Viewport = Viewport()
    datasets: List[Dataset] = []

    @classmethod
    def from_dict(cls, settings):
        return cls(**settings)
