module Dataset exposing (Dataset, decoder)

import Dataset.ID exposing (ID)
import Dataset.Label exposing (Label)
import Json.Decode exposing (Decoder, field, string)


type alias Dataset =
    { label : Dataset.Label.Label
    , id : Dataset.ID.ID
    , driver : String
    , view : String
    }


decoder : Decoder Dataset
decoder =
    Json.Decode.map4 Dataset
        (field "label" Dataset.Label.decoder)
        (field "id" Dataset.ID.decoder)
        (field "driver" string)
        (field "view" string)
