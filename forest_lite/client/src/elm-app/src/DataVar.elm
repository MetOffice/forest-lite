module DataVar exposing (SelectDataVar)

import DataVarLabel exposing (DataVarLabel)
import DatasetID exposing (DatasetID)


type alias SelectDataVar =
    { dataset_id : DatasetID
    , data_var : DataVarLabel
    }
