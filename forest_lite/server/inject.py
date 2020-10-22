"""Simple dependency injection framework"""


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
            setattr(self, method_name, fn)
            return fn
        return decorator
