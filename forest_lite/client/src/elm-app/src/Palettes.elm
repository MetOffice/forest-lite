module Palettes exposing
    ( Kind
    , Level
    , Name
    , Palettes
    , continuous
    , fromString
    , get
    , kindFromString
    , levelFromInt
    , levelToString
    , levels
    , names
    , sequential
    , toColors
    , toString
    )

import Dict exposing (Dict)


type Name
    = Name String


type alias Palettes =
    List ( String, List String )


type Palette
    = Predefined Kind Level
    | Bespoke (List String)


type Kind
    = Sequential Hue
    | Diverging
    | Qualitative


sequential : Kind
sequential =
    Sequential Single


kindFromString : String -> Maybe Kind
kindFromString str =
    case String.toLower str of
        "sequential" ->
            Just (Sequential Single)

        "diverging" ->
            Just Diverging

        "qualitative" ->
            Just Qualitative

        _ ->
            Nothing


type Hue
    = Multi
    | Single


type Level
    = Level Int


levelFromInt : Int -> Level
levelFromInt =
    Level


levelToString : Level -> String
levelToString (Level n) =
    String.fromInt n



-- TODO implement a full solution


toColors : Level -> Name -> List String
toColors (Level n) (Name str) =
    let
        colors =
            Maybe.withDefault [ "#000000", "#FFFFFF" ] (get str)
    in
    if n == 5 then
        List.reverse colors

    else
        colors


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


levels : List Level
levels =
    List.map Level [ 3, 5, 6 ]


continuous : Palettes
continuous =
    [ ( "Reds", [ "#FF0000", "#FFFFFF", "#FF0000" ] )
    , ( "Blues", [ "#0000FF", "#AAAAFF", "#000000" ] )
    , ( "Custom", [ "#FF00FF", "#AA00AA", "#000000" ] )
    ]
