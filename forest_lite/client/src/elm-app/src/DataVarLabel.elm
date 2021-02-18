module DataVarLabel exposing (DataVarLabel(..), decoder, encode, toString)

import Json.Decode exposing (Decoder, string)
import Json.Encode


type DataVarLabel
    = DataVarLabel String


decoder : Decoder DataVarLabel
decoder =
    Json.Decode.map DataVarLabel string


encode : DataVarLabel -> Json.Encode.Value
encode (DataVarLabel str) =
    Json.Encode.string str


toString : DataVarLabel -> String
toString (DataVarLabel str) =
    str
