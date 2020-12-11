
# Developer guide

To get set up first clone the repo with the SSH link to
eliminate password prompts on push.

```sh
git clone git@github.com:MetOffice/forest-lite.git
```

Then navigate inside the repo with `cd forest-lite`. At this
point it may be convenient to set up a development environment
but for simple edits, e.g. docstring changes, this step can
be done later.


## GitHub contributor flow

## Conda environment

Follow steps to install miniconda on your machine. Then
to create a dedicated environment for FOREST-Lite development
create a new one with a supported Python version.

```sh
conda create -n forestlite python=3.8
```

Activate the environment and install the necessary package
dependencies.

```sh
conda activate forestlite
```

Many of the packages are available in the `conda-forge` channel. To
install from that channel use `-c conda-forge`. As we are setting
up a development environment it is a good idea to also
install test suite dependencies found in `requirements-test.txt`.

```sh
conda install -c conda-forge --file requirements.txt --file requirements-test.txt
```

At this point your new conda environment should have all
of the necessary dependencies. The final step is to point Python
at your edits.

```sh
python setup.py develop
```

If this is your first time running the above command all of the
assets will be built.

!!! note
    The `webpack` step takes a few minutes to complete with no
    output, this is normal behaviour.

## Test suite
