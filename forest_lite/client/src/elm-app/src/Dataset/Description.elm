module Dataset.Description exposing (Description, decoder, encode)

import Attrs
import DataVar exposing (DataVar)
import Dataset.ID exposing (ID)
import Dict exposing (Dict)
import Json.Decode exposing (Decoder, dict, field)
import Json.Encode


type alias Description =
    { attrs : Dict String String
    , data_vars : Dict String DataVar
    , dataset_id : Dataset.ID.ID
    }


encode : Description -> Json.Encode.Value
encode description =
    Json.Encode.object
        [ ( "datasetId", Dataset.ID.encode description.dataset_id )
        , ( "data", encodeData description )
        ]


encodeData : Description -> Json.Encode.Value
encodeData desc =
    Json.Encode.object
        [ ( "attrs", Attrs.encode desc.attrs )
        , ( "dataset_id", Dataset.ID.encode desc.dataset_id )
        , ( "data_vars", Json.Encode.dict identity DataVar.encode desc.data_vars )
        ]


decoder : Decoder Description
decoder =
    Json.Decode.map3
        Description
        (field "attrs" Attrs.decoder)
        (field "data_vars" (dict DataVar.decoder))
        (field "dataset_id" Dataset.ID.decoder)
