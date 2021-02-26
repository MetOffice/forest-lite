module Coastlines exposing (..)

import Json.Decode exposing (Decoder, field, float, list, map2)
import Json.Encode


type alias Coastlines =
    { xs : List (List Float)
    , ys : List (List Float)
    }


decoder : Decoder Coastlines
decoder =
    map2
        Coastlines
        (field "xs" (list (list float)))
        (field "ys" (list (list float)))


encode : Coastlines -> Json.Encode.Value
encode coastlines =
    Json.Encode.object
        [ ( "xs"
          , Json.Encode.list
                (Json.Encode.list
                    Json.Encode.float
                )
                coastlines.xs
          )
        , ( "ys"
          , Json.Encode.list
                (Json.Encode.list
                    Json.Encode.float
                )
                coastlines.ys
          )
        ]
