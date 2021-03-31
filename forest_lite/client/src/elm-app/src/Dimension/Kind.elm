module Dimension.Kind exposing (Kind(..), parse)

import Dimension.Label exposing (Label)


type Kind
    = Numeric
    | Temporal
    | Horizontal


parse : Dimension.Label.Label -> Kind
parse (Dimension.Label.Label dim_name) =
    if String.contains "time" dim_name then
        Temporal

    else if String.contains "latitude" dim_name then
        Horizontal

    else if String.contains "longitude" dim_name then
        Horizontal

    else
        Numeric
