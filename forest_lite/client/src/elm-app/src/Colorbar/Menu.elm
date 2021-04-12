module Colorbar.Menu exposing (Config, Msg, update, view)

import Colorbar
import Colorbar.Limits exposing (Limits)
import Helpers exposing (onSelect)
import Html exposing (Html, div, label, option, select, text)
import Html.Attributes exposing (selected, style, value)
import Palettes exposing (Palettes)


type alias Config a =
    { a
        | limits : Limits
        , palettes : List String
        , palette : Palettes.Name
        , palette_level : Int
    }



-- UPDATE


type alias Model a =
    Colorbar.Limits.Model
        { a
            | palette_level : Int
            , palette : Palettes.Name
        }


type Msg
    = SetPalette Palettes.Name
    | SetPaletteLevels Int
    | ColorbarLimitsMsg Colorbar.Limits.Msg


update : Msg -> Model a -> ( Model a, Cmd Msg )
update msg model =
    case msg of
        SetPalette palette ->
            ( { model | palette = palette }, Cmd.none )

        SetPaletteLevels n ->
            ( { model | palette_level = n }, Cmd.none )

        ColorbarLimitsMsg subMsg ->
            let
                ( subModel, subCmd ) =
                    Colorbar.Limits.update subMsg model
            in
            ( subModel, Cmd.map ColorbarLimitsMsg subCmd )



-- VIEW


view : Config a -> Html Msg
view { limits, palettes, palette, palette_level } =
    let
        level =
            palette_level

        levels =
            Palettes.levels

        levelToMsg =
            SetPaletteLevels << Maybe.withDefault 1 << String.toInt

        name =
            Palettes.toString palette

        names =
            palettes

        nameToMsg =
            SetPalette << Palettes.fromString
    in
    div []
        [ Colorbar.view
            { title = "Title (placeholder)"
            , low = -10
            , high = 10
            , palette = Palettes.toColors palette_level palette
            }

        -- CONTROLS
        , div []
            [ viewLevels levels level levelToMsg
            , viewNames names name nameToMsg
            ]
        , Html.map ColorbarLimitsMsg (Colorbar.Limits.view limits)
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
