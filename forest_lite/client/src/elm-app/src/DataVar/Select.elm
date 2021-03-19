module DataVar.Select exposing (Select, decoder, toString)

import DataVarLabel exposing (DataVarLabel)
import Dataset.ID exposing (ID)
import Json.Decode exposing (Decoder, field)
import Json.Encode


type alias Select =
    { dataset_id : Dataset.ID.ID
    , data_var : DataVarLabel
    }


toString : Select -> String
toString props =
    Json.Encode.encode 0
        (Json.Encode.object
            [ ( "dataset_id", Dataset.ID.encode props.dataset_id )
            , ( "data_var", DataVarLabel.encode props.data_var )
            ]
        )


decoder : Decoder Select
decoder =
    Json.Decode.map2
        Select
        (field "dataset_id" Dataset.ID.decoder)
        (field "data_var" DataVarLabel.decoder)
