import warnings
from forest_lite.server.drivers.xarray_h5netcdf import driver


warnings.warn("'eida50' driver is deprecated please use 'xarray_h5netcdf'",
              DeprecationWarning)
