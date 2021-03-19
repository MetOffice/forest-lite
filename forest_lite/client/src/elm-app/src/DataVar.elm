module DataVar exposing (DataVar, decoder, encode)

import Attrs
import Dict exposing (Dict)
import Json.Decode exposing (Decoder, field, list, string)
import Json.Encode


type alias DataVar =
    { dims : List String
    , attrs : Dict String String
    }


encode : DataVar -> Json.Encode.Value
encode data_var =
    Json.Encode.object
        [ ( "attrs", Attrs.encode data_var.attrs )
        , ( "dims", Json.Encode.list Json.Encode.string data_var.dims )
        ]


decoder : Decoder DataVar
decoder =
    Json.Decode.map2
        DataVar
        (field "dims" (list string))
        (field "attrs" Attrs.decoder)
