from importlib import import_module


def from_spec(spec):
    module = import_module(f"lib.drivers.{spec.name}")
    return module.Driver(spec.name, spec.settings)
