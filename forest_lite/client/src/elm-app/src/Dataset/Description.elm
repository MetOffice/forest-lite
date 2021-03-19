module Dataset.Description exposing (Description)

import DataVar exposing (DataVar)
import Dataset.ID exposing (ID)
import Dict exposing (Dict)


type alias Description =
    { attrs : Dict String String
    , data_vars : Dict String DataVar
    , dataset_id : Dataset.ID.ID
    }
