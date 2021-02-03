"""
Initial setup script
"""
import os
import re
import subprocess
import setuptools
import setuptools.command.build_py
import setuptools.command.develop
import setuptools.command.install


NAME = "forest_lite"
JS_DIR = os.path.join(os.path.dirname(__file__), NAME, r"client")


def build_js(command_subclass):
    """Decorator to call npm install and npm run build"""
    subclass_run = command_subclass.run
    def run(self):
        self.run_command("build_js")
        subclass_run(self)
    command_subclass.run = run
    return command_subclass


@build_js
class InstallCommand(setuptools.command.install.install):
    """Python and JS code"""


@build_js
class DevelopCommand(setuptools.command.develop.develop):
    """Python and JS code"""


@build_js
class BuildPyCommand(setuptools.command.build_py.build_py):
    """Python and JS code"""


class BuildJSCommand(setuptools.command.build_py.build_py):
    """Use npm to build lite.min.js

    .. note:: Assume current working directory is package ROOT
    """
    def run(self):
        cwd = os.getcwd()
        os.chdir(JS_DIR)
        if not os.path.exists("node_modules"):
            subprocess.check_call(["npm", "install"])
        subprocess.check_call(["npm", "run", "build"])
        os.chdir(cwd)
        super().run()


setuptools.setup(
    name=NAME,
    version="0.16.3",
    author="Andrew Ryan",
    author_email="andrew.ryan@metoffice.gov.uk",
    cmdclass={
        "install": InstallCommand,
        "develop": DevelopCommand,
        "build_py": BuildPyCommand,
        "build_js": BuildJSCommand,
    },
    packages=setuptools.find_packages(),
    python_requires=">=3.6",
    entry_points={
        "console_scripts": [
            "forest_lite=forest_lite.cli:app"
        ]
    },
    package_data={
        "forest_lite.client": [
            "static/*",
        ]
    },
)
