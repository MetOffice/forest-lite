import os
import glob
import string



def get_file_names(pattern):
    """Search disk for files"""
    wildcard = string.Template(pattern).substitute(**os.environ)
    return sorted(glob.glob(wildcard))
