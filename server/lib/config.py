"""Configuration parsing"""
import bokeh.palettes
from pydantic import BaseModel, validator
from typing import List, Dict, Union


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


class NamedPalette(BaseModel):
    name: str
    number: int
    low: float = 0
    high: float = 1

    def palette(self):
        colors = bokeh.palettes.all_palettes[self.name][self.number]
        return Palette(colors=colors, low=self.low, high=self.high)


class Dataset(BaseModel):
    label: str
    driver: Driver = Driver()
    palettes: Dict[str, Palette] = {}

    @validator("palettes", pre=True, each_item=True)
    def support_named_palettes(cls, v):
        if "name" in v:
            return NamedPalette(**v).palette()
        return v


class Config(BaseModel):
    viewport: Viewport = Viewport()
    datasets: List[Dataset] = []

    @classmethod
    def from_dict(cls, settings):
        return cls(**settings)
