module Dataset.Label exposing (Label(..), decoder, encode, toString)

import Json.Decode exposing (Decoder)
import Json.Encode


type Label
    = Label String


encode : Label -> Json.Encode.Value
encode label =
    Json.Encode.string (toString label)


toString : Label -> String
toString (Label str) =
    str


decoder : Decoder Label
decoder =
    Json.Decode.map
        Label
        Json.Decode.string
