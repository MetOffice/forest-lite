"""Minimal dependency injection framework

Allows users to extend existing drivers without needing to
use class inheritance

>>> driver = Driver()
>>> @driver.override("times")
... def my_method():
...     return "My value"

It does not prevent users from extending drivers via
traditional approaches, e.g. class inheritance.

"""
from inspect import signature


class Use:
    """Container to delay execution of dependency"""
    def __init__(self, dependency):
        self.dependency = dependency


class Injectable:
    """Add function signature overriding"""
    def __init__(self):
        self.overridden_methods = []

    def override(self, method_name):
        def decorator(fn):
            if not hasattr(self, method_name):
                msg = (
                    f"'{self.__class__.__name__}' does not have"
                    f" attribute '{method_name}'")
                raise AttributeError(msg)
            setattr(self, method_name, solve_dependencies(fn))
            return fn
        return decorator


def solve_dependencies(fn):
    def wrapper(*args, **kwargs):
        deps = {}
        for key, param in signature(fn).parameters.items():
            if hasattr(param.default, "dependency"):
                deps[key] = param.default.dependency()
        kwargs.update(deps)
        return fn(*args, **kwargs)
    return wrapper
