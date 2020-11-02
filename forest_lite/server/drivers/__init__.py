from importlib import import_module


def from_spec(spec):
    try:
        module = import_module(f"forest_lite.server.drivers.{spec.name}")
    except ModuleNotFoundError as e:
        if spec.name in e.msg:
            mod_name, obj_name = spec.name.split(":")
            module = import_module(mod_name)
            return getattr(module, obj_name)
        else:
            raise e
    try:
        return module.Driver(spec.name, spec.settings)
    except AttributeError:
        # TODO: Mechanism to configure driver(s)
        driver = module.driver
        driver.settings = spec.settings
        return driver
