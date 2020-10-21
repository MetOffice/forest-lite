from importlib import import_module


def from_spec(spec):
    try:
        module = import_module(f"forest_lite.server.drivers.{spec.name}")
    except ModuleNotFoundError:
        mod_name, obj_name = spec.name.split(":")
        module = import_module(mod_name)
        return getattr(module, obj_name)
    return module.Driver(spec.name, spec.settings)
