module NaturalEarthFeature.Action exposing (Action(..), key, payload)

import Json.Encode


type Action
    = SetLineWidth Int
    | SetColor String


key : Action -> String
key action =
    case action of
        SetLineWidth _ ->
            "SET_NATURAL_EARTH_FEATURE_LINEWIDTH"

        SetColor color ->
            "SET_COASTLINES_COLOR"


payload : Action -> Json.Encode.Value
payload action =
    case action of
        SetLineWidth n ->
            Json.Encode.int n

        SetColor color ->
            Json.Encode.string color
