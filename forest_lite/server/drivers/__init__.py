from importlib import import_module
from forest_lite.server.drivers.base import BaseDriver


def from_spec(spec):
    return find_driver(spec.name)


def find_driver(name: str):
    """Find driver instance"""
    try:
        module = import_module(f"forest_lite.server.drivers.{name}")
        return module.driver
    except ModuleNotFoundError as e:
        if name in e.msg:
            mod_name, obj_name = name.split(":")
            module = import_module(mod_name)
            return getattr(module, obj_name)
        else:
            raise e
