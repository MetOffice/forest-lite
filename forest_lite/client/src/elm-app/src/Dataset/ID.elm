module Dataset.ID exposing (ID, decoder, encode, toInt, toString)

import Json.Decode
import Json.Encode


type ID
    = ID Int


encode : ID -> Json.Encode.Value
encode (ID id) =
    Json.Encode.int id


decoder : Json.Decode.Decoder ID
decoder =
    Json.Decode.map
        ID
        Json.Decode.int


toInt : ID -> Int
toInt (ID n) =
    n


toString : ID -> String
toString id =
    String.fromInt (toInt id)
