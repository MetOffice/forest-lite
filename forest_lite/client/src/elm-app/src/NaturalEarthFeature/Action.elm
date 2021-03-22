module NaturalEarthFeature.Action exposing (Action(..), key, payload)

import Json.Encode


type Action
    = SetWidth Int
    | SetColor String


key : Action -> String
key action =
    case action of
        SetWidth _ ->
            "SET_COASTLINES_WIDTH"

        SetColor color ->
            "SET_COASTLINES_COLOR"


payload : Action -> Json.Encode.Value
payload action =
    case action of
        SetWidth n ->
            Json.Encode.int n

        SetColor color ->
            Json.Encode.string color
