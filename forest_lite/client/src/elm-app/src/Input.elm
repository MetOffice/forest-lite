module Input exposing (viewColorPicker, viewNumber)

import Html
    exposing
        ( Attribute
        , Html
        , div
        , input
        , label
        , text
        )
import Html.Attributes
    exposing
        ( attribute
        , for
        , id
        , style
        , value
        )
import Html.Events
    exposing
        ( on
        , targetValue
        )
import Json.Decode


onSelect : (String -> msg) -> Attribute msg
onSelect tagger =
    on "change" (Json.Decode.map tagger targetValue)


{-| Color picker

HTML input tag with type set to color

-}
viewColorPicker : (String -> msg) -> String -> Html msg
viewColorPicker toMsg str =
    let
        inputId =
            "coastline-color"
    in
    div
        [ style "margin-top" "0.3em"
        ]
        [ div
            [ style "border-radius" "4px"
            , style "overflow" "hidden"
            , style "width" "13px"
            , style "height" "13px"
            , style "display" "inline-block"
            , style "margin" "0 0.5em"
            , style "border" "1px solid #333"
            ]
            [ input
                [ attribute "type" "color"
                , value str
                , onSelect toMsg
                , id inputId
                , style "background-color" "white"
                , style "border" "none"
                , style "padding" "0"
                , style "cursor" "pointer"
                , style "width" "200%"
                , style "height" "200%"
                , style "transform" "translate(-25%,-25%)"
                ]
                []
            ]
        , label
            [ for inputId
            , style "cursor" "pointer"
            ]
            [ text "Choose coastline color" ]
        ]


{-| Number widget

HTML input tag with type set to number

-}
viewNumber : (String -> msg) -> Int -> Html msg
viewNumber toMsg n =
    let
        inputId =
            "coastline-width"
    in
    div
        [ style "margin-top" "0.3em"
        ]
        [ div
            [ style "display" "inline-block"
            , style "margin" "0 0.5em"
            ]
            [ input
                [ attribute "type" "number"
                , value (String.fromInt n)
                , attribute "min" "1"
                , onSelect toMsg
                , id inputId
                , style "width" "2em"
                , style "border" "1px solid #ccc"
                , style "border-radius" "4px"
                , style "padding" "6px 4px"
                ]
                []
            ]
        , label
            [ for inputId
            , style "cursor" "pointer"
            ]
            [ text "Choose coastline width" ]
        ]
