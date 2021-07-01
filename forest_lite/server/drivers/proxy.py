"""
Map FOREST-Lite REST API to source API
"""
import aiohttp
import json
import urllib.parse
from pydantic import BaseModel
from forest_lite.server.drivers.base import BaseDriver


class Settings(BaseModel):
    url: str


driver = BaseDriver()


@driver.override("description")
async def description(settings_dict):
    url = Settings(**settings_dict).url
    endpoint = f"{url}/datasets/0"
    async with aiohttp.ClientSession() as session:
        async with session.get(endpoint) as response:
            content = await response.json()
    return content


@driver.override("points")
async def points(settings_dict, data_var, dim_name, query=None):
    url = Settings(**settings_dict).url
    endpoint = f"{url}/datasets/0/{data_var}/axis/{dim_name}"
    async with aiohttp.ClientSession() as session:
        async with session.get(endpoint) as response:
            content = await response.json()
    return content


@driver.override("data_tile")
async def data_tile(settings_dict, data_var, z, x, y, query=None):
    url = Settings(**settings_dict).url
    dataset_id = 0
    endpoint = f"{url}/datasets/{dataset_id}/{data_var}/tiles/{z}/{x}/{y}"
    if query is not None:
        query = urllib.parse.quote(json.dumps(query))
        endpoint = f"{endpoint}?query={query}"

    async with aiohttp.ClientSession() as session:
        async with session.get(endpoint) as response:
            content = await response.json()
    return content
