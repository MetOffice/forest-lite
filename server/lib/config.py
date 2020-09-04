"""Configuration parsing"""
from dataclasses import dataclass, field


@dataclass
class Driver:
    name: str = ""
    settings: dict = field(default_factory=dict)


@dataclass
class Dataset:
    label: str
    driver: dict = field(default_factory=dict)

    def __post_init__(self):
        if isinstance(self.driver, dict):
            self.driver = Driver(**self.driver)


@dataclass
class Config:
    datasets: list = field(default_factory=list)

    @classmethod
    def from_dict(cls, settings):
        return cls(**settings)

    def __post_init__(self):
        datasets = []
        for dataset in self.datasets:
            if isinstance(dataset, dict):
                dataset = Dataset(**dataset)
            datasets.append(dataset)
        self.datasets = datasets
