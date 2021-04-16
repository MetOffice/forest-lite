module Colorbar.Menu exposing (Msg, update, view)

import ColorSchemeRequest exposing (ColorScheme)
import Colorbar
import DataVar.Select exposing (Select)
import Helpers exposing (onSelect)
import Html exposing (Html, div, label, option, select, text)
import Html.Attributes exposing (selected, style, value)



-- UPDATE


type alias Model a =
    { a
        | colorSchemes : List ColorScheme
    }


type Msg
    = NOOP


update : Msg -> Model a -> ( Model a, Cmd Msg )
update msg model =
    case msg of
        NOOP ->
            ( model, Cmd.none )



-- VIEW


view : Model a -> Html Msg
view _ =
    div []
        [ Colorbar.view
            { title = "Title (placeholder)"
            , low = -10
            , high = 10
            , palette = [ "#FFFFFF", "#000000" ]
            }
        ]


viewNames : List String -> String -> (String -> Msg) -> Html Msg
viewNames names name toMsg =
    div
        [ style "display" "inline-block"
        , style "margin-left" "1em"
        ]
        [ label
            [ style "display" "block"
            , style "font-size" "0.9em"
            ]
            [ text "Named palette:"
            ]
        , select
            [ onSelect toMsg
            , style "width" "100%"
            ]
            (List.map
                (\n ->
                    option
                        [ selected (n == name)
                        ]
                        [ text n ]
                )
                names
            )
        ]


viewLevels : List Int -> Int -> (String -> Msg) -> Html Msg
viewLevels levels level toMsg =
    div [ style "display" "inline-block" ]
        [ label
            [ style "display" "block"
            , style "font-size" "0.9em"
            ]
            [ text "Data levels:"
            ]
        , select
            [ style "width" "100%"
            , onSelect toMsg
            ]
            (List.map
                (\n ->
                    option
                        [ selected (n == level)
                        , value (String.fromInt n)
                        ]
                        [ text (String.fromInt n) ]
                )
                levels
            )
        ]
