import h5netcdf


def sample_h5netcdf(path, data_vars=None):
    # EIDA50 sample
    with h5netcdf.File(path, "w") as f:
        f.dimensions = {
            "time": 1,
            "longitude": 2,
            "latitude": 2}

        # Time
        v = f.create_variable("time", ("time",), "d")
        v[:] = 0
        v.attrs.update({
            "axis": "T",
            "units": "hours since 1970-01-01 00:00:00",
            "standard_name": "time",
            "calendar": "gregorian"
        })

        # Longitude
        v = f.create_variable("longitude", ("longitude",), "f")
        v[:] = [-90, 90]
        v.attrs.update({
            "axis": "X",
            "units": "degrees_east",
            "standard_name": "longitude",
        })

        # Latitude
        v = f.create_variable("latitude", ("latitude",), "f")
        v[:] = [-45, 45]
        v.attrs.update({
            "axis": "Y",
            "units": "degrees_north",
            "standard_name": "latitude",
        })

        # Data
        if data_vars is None:
            data_vars = ["data"]
        for data_var in data_vars:
            v = f.create_variable(data_var,
                                  ("time", "latitude", "longitude"), "f")
            v[:] = [[0, 1], [2, 3]]
            v.attrs.update({
                "_FillValue": -99999.,
                "units": "K",
                "standard_name": "toa_brightness_temperature",
                "long_name": "toa_brightness_temperature",
            })


def sample_h5netcdf_dim0(path):
    with h5netcdf.File(path, "w") as f:
        f.dimensions = {
            "dim0": 1,
            "longitude": 2,
            "latitude": 2}

        # Time
        v = f.create_variable("time", ("dim0",), "d")
        v[:] = 0
        v.attrs.update({
            "axis": "T",
            "units": "hours since 1970-01-01 00:00:00",
            "standard_name": "time",
            "calendar": "gregorian"
        })

        # Longitude
        v = f.create_variable("longitude", ("longitude",), "f")
        v[:] = [-90, 90]
        v.attrs.update({
            "axis": "X",
            "units": "degrees_east",
            "standard_name": "longitude",
        })

        # Latitude
        v = f.create_variable("latitude", ("latitude",), "f")
        v[:] = [-45, 45]
        v.attrs.update({
            "axis": "Y",
            "units": "degrees_north",
            "standard_name": "latitude",
        })

        # Data
        v = f.create_variable("air_temperature",
                              ("dim0", "latitude", "longitude"), "f")
        v[:] = [[0, 1], [2, 3]]
        v.attrs.update({
            "_FillValue": -99999.,
            "units": "K",
            "standard_name": "air_temperature",
            "long_name": "air_temperature",
            "coordinates": "forecast_period forecast_reference_time time pressure"
        })
