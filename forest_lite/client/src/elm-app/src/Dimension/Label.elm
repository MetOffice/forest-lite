module Dimension.Label exposing
    ( Label(..)
    , decoder
    , encode
    , toString
    )

import Json.Decode exposing (Decoder, string)
import Json.Encode


type Label
    = Label String


encode : Label -> Json.Encode.Value
encode (Label str) =
    Json.Encode.string str


decoder : Decoder Label
decoder =
    Json.Decode.map Label string


toString : Label -> String
toString (Label str) =
    str
