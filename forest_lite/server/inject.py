"""Simple dependency injection framework"""
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
            setattr(self, method_name, solve_dependencies(fn))
            return fn
        return decorator


def solve_dependencies(fn):
    def wrapper():
        kwargs = {}
        for key, param in signature(fn).parameters.items():
            if hasattr(param.default, "dependency"):
                kwargs[key] = param.default.dependency()
        return fn(**kwargs)
    return wrapper
