
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


```python
from forest_lite import api


driver_name = "my_driver"  # Key to map request to settings


@api.tile(driver_name)
def my_custom_func(driver_settings, datavar, x, y, z, query=None):
    """A function that replies to a tile endpoint"""
    pass
```


