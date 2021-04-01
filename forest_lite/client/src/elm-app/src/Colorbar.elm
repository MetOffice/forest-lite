module Colorbar exposing (Config, view)

import Html exposing (Attribute, Html, node)
import Html.Attributes exposing (attribute)
import Json.Encode


type alias Config =
    { low : Float
    , high : Float
    , palette : List String
    , title : String
    }


view : Config -> Html msg
view { low, high, title, palette } =
    bokehColorbar
        [ attribute "title" title
        , attribute "low"
            (Json.Encode.encode 0
                (Json.Encode.float low)
            )
        , attribute "high"
            (Json.Encode.encode 0
                (Json.Encode.float high)
            )
        , attribute "palette"
            (Json.Encode.encode 0
                (Json.Encode.list Json.Encode.string
                    palette
                )
            )
        ]
        []


bokehColorbar : List (Attribute a) -> List (Html a) -> Html a
bokehColorbar =
    node "bk-colorbar"
