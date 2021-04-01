module Helpers exposing (onSelect)

import Html exposing (Attribute)
import Html.Events exposing (on, targetValue)
import Json.Decode



-- Select on "change" event


onSelect : (String -> msg) -> Attribute msg
onSelect tagger =
    on "change" (Json.Decode.map tagger targetValue)
