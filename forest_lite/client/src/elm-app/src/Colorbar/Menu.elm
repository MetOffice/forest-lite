module Colorbar.Menu exposing (Config, Msg, update, view)

import ColorSchemeRequest exposing (ColorScheme)
import Colorbar
import Colorbar.Limits exposing (Limits)
import DataVar.Select exposing (Select)
import Helpers exposing (onSelect)
import Html exposing (Html, div, label, option, select, text)
import Html.Attributes exposing (selected, style, value)


type alias Config a =
    { a
        | limits : Limits
    }



-- UPDATE


type alias Model a =
    { a
        | colorSchemes : List ColorScheme
        , limits : Limits
        , selected : Maybe DataVar.Select.Select
    }


type Msg
    = ColorbarLimitsMsg Colorbar.Limits.Msg


update : Msg -> Model a -> ( Model a, Cmd Msg )
update msg model =
    case msg of
        ColorbarLimitsMsg subMsg ->
            let
                ( subModel, subCmd ) =
                    Colorbar.Limits.update subMsg model
            in
            ( subModel, Cmd.map ColorbarLimitsMsg subCmd )



-- VIEW


view : Config a -> Html Msg
view config =
    div []
        [ Colorbar.view
            { title = "Title (placeholder)"
            , low = -10
            , high = 10
            , palette = [ "#FFFFFF", "#000000" ]
            }

        -- CONTROLS
        , Html.map ColorbarLimitsMsg (Colorbar.Limits.view config.limits)
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
