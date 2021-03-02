module MultiLine exposing (..)

import Json.Decode exposing (Decoder, field, float, list, map2)
import Json.Encode


type alias MultiLine =
    { xs : List (List Float)
    , ys : List (List Float)
    }


decoder : Decoder MultiLine
decoder =
    map2
        MultiLine
        (field "xs" (list (list float)))
        (field "ys" (list (list float)))


encode : MultiLine -> Json.Encode.Value
encode data =
    Json.Encode.object
        [ ( "xs"
          , Json.Encode.list
                (Json.Encode.list
                    Json.Encode.float
                )
                data.xs
          )
        , ( "ys"
          , Json.Encode.list
                (Json.Encode.list
                    Json.Encode.float
                )
                data.ys
          )
        ]
