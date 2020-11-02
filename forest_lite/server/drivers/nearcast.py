"""
Nearcast driver
"""
import os
import glob
import string
from forest_lite.server.inject import Use
from forest_lite.server.drivers.base import BaseDriver
from pydantic import BaseModel


class Settings(BaseModel):
    pattern: str


driver = BaseDriver()


def get_file_names():
    """Search disk for Nearcast files"""
    pattern = Settings(**driver.settings).pattern
    wildcard = string.Template(pattern).substitute(**os.environ)
    return sorted(glob.glob(wildcard))


@driver.override("get_times")
def nearcast_times(limits=None, file_names=Use(get_file_names)):
    print(file_names)
    return []
