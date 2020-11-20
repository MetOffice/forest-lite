
# Driver proposal

To visualise data without prior knowledge of its format, directory
structure or whether it is local or remote a general framework
is needed.

## History

Early versions to solve this problem focussed on an object-oriented hierarchy.

```python

class Driver:
    def method(self, ...):
        pass
```

## Simplest possible interface

A simpler design is to template the methods that are used
by the application machinery and allow users to extend them
as they see fit. To discourage deeply nested inheritance
and fragile driver state a decorator syntax has been chosen.

```python
from forest_lite.server.drivers.base import BaseDriver


driver = BaseDriver()


@driver.override("tilable")
def my_custom_func(driver_settings, datavar, query=None):
    """A function that replies to a tile endpoint"""
    pass
```


