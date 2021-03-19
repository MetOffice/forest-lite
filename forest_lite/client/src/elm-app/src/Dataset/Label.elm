module Dataset.Label exposing (Label(..), decoder, toString)

import Json.Decode exposing (Decoder)


type Label
    = Label String


toString : Label -> String
toString (Label str) =
    str


decoder : Decoder Label
decoder =
    Json.Decode.map
        Label
        Json.Decode.string
