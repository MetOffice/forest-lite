"""GraphQL endpoint"""
from fastapi import APIRouter
from starlette.graphql import GraphQLApp
import graphene
from graphene import Field, List, String, Int, NonNull
import pkg_resources
from functools import lru_cache
import json


JSON_FILE = pkg_resources.resource_filename("forest_lite.server.routers",
                                            "data/colorbrewer.json")


@lru_cache
def load(file_name):
    with open(file_name) as stream:
        data = json.load(stream)
    return data


class Palette(graphene.ObjectType):
    """A fixed number of colors related to a scheme"""
    rank = NonNull(Int)
    rgbs = NonNull(List(NonNull(String)))


class Kind(graphene.Enum):
    """Visual categorisation of color swatches"""
    SEQUENTIAL = 0
    DIVERGING = 1
    QUALITATIVE = 2


class ColorScheme(graphene.ObjectType):
    """Named color scheme

    Contains one or more palettes that differ by the number of colors used
    in each palette. The number of colors in a palette is called its rank. A
    color scheme contains palettes of various ranks that share a consistent
    look and feel.
    """
    name = String()
    kind = Kind()
    palettes = Field(List(Palette), rank=Int())

    def resolve_palettes(root, info, rank=None):
        if rank is None:
            return root.palettes
        else:
            return [palette for palette in root.palettes
                    if palette.rank == rank ]


def parse_kind(key):
    """Extract kind from colorbrewer.json"""
    if key == "seq":
        return Kind.SEQUENTIAL
    elif key == "div":
        return Kind.DIVERGING
    elif key == "qual":
        return Kind.QUALITATIVE


def parse_palettes(data):
    """Extract palettes from colorbrewer.json"""
    return [Palette(rank=int(key), rgbs=value)
            for key, value in data.items() if key != "type"]


class Query(graphene.ObjectType):
    """Root query for the /graphql endpoint"""

    color_schemes = Field(List(ColorScheme),
                          kind=Kind(),
                          rank=Int(),
                          name=String())

    def resolve_color_schemes(root, info, kind=None, rank=None, name=None):
        """Traverse Colorbrewer 2.0 data structure"""

        data = load(JSON_FILE)

        if name is None:
            schemes = []
            for key, value in data.items():
                scheme = ColorScheme(name=key,
                                  kind=parse_kind(value['type']),
                                  palettes=parse_palettes(value)
                                  )
                schemes.append(scheme)
        else:
            # Select scheme by name
            schemes = [
                ColorScheme(name=name,
                        kind=parse_kind(data[name]['type']),
                        palettes=parse_palettes(data[name])
                        )]

        # Filter by scheme kind
        if kind is not None:
            schemes = [scheme for scheme in schemes
                        if scheme.kind == kind]

        # Filter by number of levels in a palette
        if rank is not None:
            schemes = [scheme for scheme in schemes
                        if rank in [palette.rank for palette in scheme.palettes]]
        return schemes


router = APIRouter()


router.add_route("/graphql", GraphQLApp(schema=graphene.Schema(query=Query)))
