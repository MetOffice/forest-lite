module Point exposing (Point)

import Datum exposing (Datum)
import Dict exposing (Dict)


type alias Point =
    Dict String Datum
