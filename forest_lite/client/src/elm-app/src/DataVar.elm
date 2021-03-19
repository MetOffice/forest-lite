module DataVar exposing (DataVar)

import Dict exposing (Dict)


type alias DataVar =
    { dims : List String
    , attrs : Dict String String
    }
