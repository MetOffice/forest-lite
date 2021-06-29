"""
Geographic utilities module
---------------------------

Module to handle projection and sampling of points for imaging.

.. autofunction:: web_mercator

"""
try:
    import cartopy
except ImportError:
    # ReadTheDocs unable to pip install cartopy
    pass

import numpy as np
import datashader
import xarray



def datashader_stretch(values, gx, gy, x_range, y_range,
                       plot_height=None,
                       plot_width=None):
    """
    Use datashader to sample the data mesh in on a regular grid for use in
    image display.

    :param values: A numpy array of image data
    :param gx: The array of coordinates in projection space.
    :param gy: The array of coordinates in projection space.
    :param x_range: The range of the mesh in projection space.
    :param y_range: The range of the mesh in projection space.
    :return: An xarray of image data representing pixels.
    """
    if plot_height is None:
        plot_height = values.shape[0]
    if plot_width is None:
        plot_width = values.shape[1]
    canvas = datashader.Canvas(plot_height=plot_height,
                               plot_width=plot_width,
                               x_range=x_range,
                               y_range=y_range)
    if gx.ndim == 1:
        # 1D Quadmesh
        xarr = xarray.DataArray(values, coords=[('y', gy), ('x', gx)], name='Z')
        image = canvas.quadmesh(xarr)
    else:
        # 2D Quadmesh
        xarr = xarray.DataArray(values,
                                dims=['Y', 'X'],
                                coords={
                                    'Qx': (['Y', 'X'], gx),
                                    'Qy': (['Y', 'X'], gy)
                                },
                                name='Z')
        image = canvas.quadmesh(xarr, x='Qx', y='Qy')
    return np.ma.masked_array(image.values,
                          mask=np.isnan(
                              image.values))


def web_mercator(lons, lats):
    return transform(
            lons,
            lats,
            cartopy.crs.PlateCarree(),
            cartopy.crs.Mercator.GOOGLE)


def transform(x, y, src_crs, dst_crs):
    x, y = np.asarray(x), np.asarray(y)
    xt, yt, _ = dst_crs.transform_points(src_crs, x.flatten(), y.flatten()).T
    return xt, yt
