module DataVar.Label exposing (Label(..), decoder, encode, toString)

import Json.Decode exposing (Decoder, string)
import Json.Encode


type Label
    = Label String


decoder : Decoder Label
decoder =
    Json.Decode.map Label string


encode : Label -> Json.Encode.Value
encode (Label str) =
    Json.Encode.string str


toString : Label -> String
toString (Label str) =
    str
