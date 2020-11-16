import setuptools


setuptools.setup(
    name="forest_lite",
    version="0.0.1",
    author="Andrew Ryan",
    author_email="andrew.ryan@metoffice.gov.uk",
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
