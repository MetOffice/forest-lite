module Attrs exposing (decoder, encode)

import Dict exposing (Dict)
import Json.Decode exposing (Decoder, dict, string)
import Json.Encode


encode : Dict String String -> Json.Encode.Value
encode attrs =
    Json.Encode.dict identity Json.Encode.string attrs


decoder : Decoder (Dict String String)
decoder =
    dict (Json.Decode.oneOf [ string, Json.Decode.succeed "" ])
