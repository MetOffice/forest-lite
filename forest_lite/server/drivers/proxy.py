"""
Map FOREST-Lite REST API to source API
"""
import aiohttp
from pydantic import BaseModel
from forest_lite.server.drivers.base import BaseDriver


class Settings(BaseModel):
    url: str
    dataset_id: int


driver = BaseDriver()


@driver.override("description")
async def description(settings_dict):
    url = Settings(**settings_dict).url
    dataset_id = Settings(**settings_dict).dataset_id
    endpoint = f"{url}/datasets/{dataset_id}"
    return await http_get(endpoint)


@driver.override("points")
async def points(settings_dict, data_var, dim_name, query=None):
    url = Settings(**settings_dict).url
    dataset_id = Settings(**settings_dict).dataset_id
    endpoint = f"{url}/datasets/{dataset_id}/{data_var}/axis/{dim_name}"
    return await http_get(endpoint)


@driver.override("data_tile")
async def data_tile(settings_dict, data_var, z, x, y, query=None):
    url = Settings(**settings_dict).url
    dataset_id = Settings(**settings_dict).dataset_id
    endpoint = f"{url}/datasets/{dataset_id}/{data_var}/tiles/{z}/{x}/{y}"
    if query is not None:
        endpoint = f"{endpoint}?query={query}"
    return await http_get(endpoint)


async def http_get(endpoint):
    async with aiohttp.ClientSession() as session:
        async with session.get(endpoint) as response:
            content = await response.json()
    return content
