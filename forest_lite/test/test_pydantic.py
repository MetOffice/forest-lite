import datetime as dt
import pytz
import pytest
from pytest import param
from pydantic import BaseModel, root_validator
from typing import List


UTC = pytz.timezone("utc")


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


@pytest.mark.parametrize("time,expect", [
    param(0,
          dt.datetime(1970, 1, 1, tzinfo=UTC),
          id="Unix time zero"),
    param(1611918983182,
          dt.datetime(2021, 1, 29, 11, 16, 23, 182000, tzinfo=UTC),
          id="JS Date.now() miliseconds"),
    param(1611918983,
          dt.datetime(2021, 1, 29, 11, 16, 23, tzinfo=UTC),
          id="JS Date.now() seconds"),
    param(1611918983,
          dt.datetime(2021, 1, 29, 11, 16, 23, tzinfo=UTC),
          id="JS Date.now() seconds"),
])
def test_datetime_type_casting(time, expect):
    """learn how Pydantic handles datetime coercion from int

    .. note: watershed for detection of ms/s is +/-2e10 so dates earlier
             than 2001 are ambiguous
    """

    class Model(BaseModel):
        time: dt.datetime

    model = Model(time=time)
    assert model.time == expect
