module DatasetID exposing (DatasetID, decoder, encode, toInt, toString)

import Json.Decode
import Json.Encode


type DatasetID
    = DatasetID Int


encode : DatasetID -> Json.Encode.Value
encode (DatasetID id) =
    Json.Encode.int id


decoder : Json.Decode.Decoder DatasetID
decoder =
    Json.Decode.map
        DatasetID
        Json.Decode.int


toInt : DatasetID -> Int
toInt (DatasetID n) =
    n


toString : DatasetID -> String
toString id =
    String.fromInt (toInt id)
