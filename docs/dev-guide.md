
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

The inner workings of git are better documented elsewhere on the web. The
advice here is to fork the repository, check out your fork and configure
your `remote` and `origin` upstream locations to point to the correct
places.

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

A good way to make sure your environment is set up and you are starting
with the right stuff is to run both the `server` and `client` tests.

```sh
pytest --disable-warnings
```

To run the JavaScript tests navigate to `forest_lite/client` directory
and run the following command.

```sh
npm run test
```

Jest test runner is configured to run with a file watcher which may be
convenient when developing JS.

```sh
npm run watch
```

The development server can be launched to respond to live changes to the
JS/CSS code via the `webpack-dev-server` lib.

```sh
npm start
```
