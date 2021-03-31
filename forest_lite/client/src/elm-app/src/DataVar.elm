module DataVar exposing (DataVar, decoder, encode)

import Attrs
import Dict exposing (Dict)
import Dimension.Label exposing (Label)
import Json.Decode exposing (Decoder, field, list, string)
import Json.Encode


type alias DataVar =
    { dims : List Dimension.Label.Label
    , attrs : Dict String String
    }


encode : DataVar -> Json.Encode.Value
encode data_var =
    Json.Encode.object
        [ ( "attrs", Attrs.encode data_var.attrs )
        , ( "dims", Json.Encode.list Dimension.Label.encode data_var.dims )
        ]


decoder : Decoder DataVar
decoder =
    Json.Decode.map2
        DataVar
        (field "dims" (list Dimension.Label.decoder))
        (field "attrs" Attrs.decoder)
