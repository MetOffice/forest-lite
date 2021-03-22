module NaturalEarthFeature.Action exposing (Action, encode, key)

import Json.Encode


type Action
    = SetLineWidth Int


key : Action -> String
key action =
    case action of
        SetLineWidth _ ->
            "SET_NATURAL_EARTH_FEATURE_LINEWIDTH"


encode : Action -> Json.Encode.Value
encode action =
    case action of
        SetLineWidth n ->
            Json.Encode.int n
