"""Configuration parsing"""
import bokeh.palettes
from pydantic import BaseModel, root_validator, validator, ValidationError
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
    reverse: bool = False
    low: float = 0
    high: float = 1

    @root_validator()
    def must_be_valid_bokeh_palette(cls, values):
        try:
            name = values.get("name")
            number = values.get("number")
            bokeh.palettes.all_palettes[name][number]
        except KeyError:
            msg = f"{name} {number} not in bokeh.palettes.all_palette"
            raise ValueError(msg)
        return values

    def palette(self):
        colors = bokeh.palettes.all_palettes[self.name][self.number]
        if self.reverse:
            colors = colors[::-1]
        return Palette(colors=colors, low=self.low, high=self.high)


class Dataset(BaseModel):
    label: str
    view: str = "tiled_image"
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
