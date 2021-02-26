module Datum exposing (..)

import Json.Decode exposing (Decoder)
import Json.Encode


type Datum
    = Discrete Int
    | Continuous Float


decoder : Decoder Datum
decoder =
    Json.Decode.oneOf
        [ Json.Decode.map Discrete Json.Decode.int
        , Json.Decode.map Continuous Json.Decode.float
        ]


encode : Datum -> Json.Encode.Value
encode datum =
    case datum of
        Discrete x ->
            Json.Encode.int x

        Continuous x ->
            Json.Encode.float x


toInt : Datum -> Int
toInt datum =
    case datum of
        Discrete x ->
            x

        Continuous x ->
            round x


toString : Datum -> String
toString datum =
    case datum of
        Discrete x ->
            String.fromInt x

        Continuous x ->
            String.fromFloat x
