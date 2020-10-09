"""Configuration parsing"""
from dataclasses import dataclass, field
from pydantic import BaseModel
from typing import List


class Viewport(BaseModel):
    """Map extents"""
    longitude: List[float] = [-180, 180]
    latitude: List[float] = [-85, 85]


@dataclass
class Driver:
    name: str = ""
    settings: dict = field(default_factory=dict)


@dataclass
class Dataset:
    label: str
    driver: dict = field(default_factory=dict)
    palette: dict = field(default_factory=dict)

    def __post_init__(self):
        if isinstance(self.driver, dict):
            self.driver = Driver(**self.driver)


@dataclass
class Config:
    viewport: Viewport = field(default_factory=Viewport)
    datasets: list = field(default_factory=list)

    @classmethod
    def from_dict(cls, settings):
        return cls(**settings)

    def __post_init__(self):

        if isinstance(self.viewport, dict):
            self.viewport = Viewport(**self.viewport)

        datasets = []
        for dataset in self.datasets:
            if isinstance(dataset, dict):
                dataset = Dataset(**dataset)
            datasets.append(dataset)
        self.datasets = datasets
