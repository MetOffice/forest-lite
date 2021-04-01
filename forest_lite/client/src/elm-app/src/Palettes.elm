module Palettes exposing
    ( Name
    , Palettes
    , continuous
    , fromString
    , get
    , names
    , toColors
    , toString
    )

import Dict exposing (Dict)


type Name
    = Name String


type alias Palettes =
    List ( String, List String )


toColors : Name -> List String
toColors (Name str) =
    Maybe.withDefault [ "#000000", "#FFFFFF" ] (get str)


fromString : String -> Name
fromString str =
    Name str


toString : Name -> String
toString (Name str) =
    str


names : List String
names =
    List.map
        (\( k, _ ) -> k)
        continuous


get : String -> Maybe (List String)
get name =
    Dict.get name (Dict.fromList continuous)


continuous : Palettes
continuous =
    [ ( "Reds", [ "#FF0000", "#FFFFFF", "#FF0000" ] )
    , ( "Blues", [ "#0000FF", "#AAAAFF", "#000000" ] )
    , ( "Custom", [ "#FF00FF", "#AA00AA", "#000000" ] )
    ]
