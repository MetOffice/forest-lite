"""Types that define communication with the front-end client"""
from typing import Dict, List
from pydantic import BaseModel


class PointsAttrs(BaseModel):
    standard_name: str = ""
    units: str = ""


class Points(BaseModel):
    data_var: str
    dim_name: str
    data: list
    attrs: PointsAttrs


class DataVarAttrs(BaseModel):
    units: str = ""
    long_name: str = ""


class DataVar(BaseModel):
    dims: List[str] = []
    attrs: DataVarAttrs


class Description(BaseModel):
    attrs: Dict[str, str]
    data_vars: Dict[str, DataVar]
