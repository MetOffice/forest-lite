from pydantic import BaseModel, root_validator
from typing import List


class Item(BaseModel):
    uid: int = 0


def auto_id(items):
    for i, item in enumerate(items):
        if "uid" in dict(item):
            yield item
        else:
            yield dict(item, uid=i)


class Config(BaseModel):
    items: List[Item]

    @root_validator(pre=True)
    def auto_id(cls, values):
        """Auto-index items"""
        prop = "items"
        if prop in values:
            values[prop] = list(auto_id(values[prop]))
        return values


def test_autoindex():
    values = {"items": [{}, {}, Item(uid=5)]}
    conf = Config(**values)
    assert conf == Config(items=[{"uid": 0}, {"uid": 1}, {"uid": 5}])
    assert conf.items[2].uid == 5
    assert "uid" not in values["items"][0]
