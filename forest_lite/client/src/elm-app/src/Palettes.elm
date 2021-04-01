module Palettes exposing (Palettes, continuous, get, names)

import Dict exposing (Dict)


type alias Palettes =
    Dict String (List String)


names : List String
names =
    Dict.keys continuous


get : String -> Maybe (List String)
get name =
    Dict.get name continuous


continuous : Palettes
continuous =
    Dict.fromList
        [ ( "Reds", [ "#FF0000", "#FFFFFF", "#FF0000" ] )
        , ( "Blues", [ "#0000FF", "#AAAAFF", "#000000" ] )
        , ( "Custom", [ "#FF00FF", "#AA00AA", "#000000" ] )
        ]
