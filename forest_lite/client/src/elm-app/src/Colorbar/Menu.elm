module Colorbar.Menu exposing (Model, Msg, update, view)

import Colorbar
import Colorbar.Limits exposing (Limits)
import DataVar.Select exposing (Select)
import Helpers exposing (onSelect)
import Html exposing (Html, div, h1, label, option, select, text)
import Html.Attributes exposing (selected, style, value)
import Palettes exposing (Level, Palettes)



-- MODEL


type alias Model a =
    { a
        | palette_level : Palettes.Level
        , palette_kind : Palettes.Kind
        , palette : Palettes.Name
        , palettes : List String
        , limits : Colorbar.Limits.Limits
        , selected : Maybe DataVar.Select.Select
    }


type Msg
    = SetPalette Palettes.Name
    | SetPaletteLevels Palettes.Level
    | SetKind Palettes.Kind
    | ColorbarLimitsMsg Colorbar.Limits.Msg



-- UPDATE


update : Msg -> Model a -> ( Model a, Cmd Msg )
update msg model =
    case msg of
        SetKind kind ->
            ( model, Cmd.none )

        SetPalette palette ->
            ( { model | palette = palette }, Cmd.none )

        SetPaletteLevels palette_level ->
            ( { model | palette_level = palette_level }, Cmd.none )

        ColorbarLimitsMsg subMsg ->
            let
                ( subModel, subCmd ) =
                    Colorbar.Limits.update subMsg model
            in
            ( subModel, Cmd.map ColorbarLimitsMsg subCmd )



-- VIEW


view : Model a -> Html Msg
view model =
    let
        kind =
            model.palette_kind

        level =
            model.palette_level

        levels =
            Palettes.levels

        levelToMsg =
            SetPaletteLevels
                << Palettes.levelFromInt
                << Maybe.withDefault 1
                << String.toInt

        name =
            Palettes.toString model.palette

        names =
            model.palettes

        nameToMsg =
            SetPalette << Palettes.fromString
    in
    div []
        [ Colorbar.view
            { title = "Title (placeholder)"
            , low = -10
            , high = 10
            , palette = Palettes.toColors model.palette_level model.palette
            }

        -- CONTROLS
        , div
            [ style "display" "grid"
            ]
            [ viewLevels levels level levelToMsg
            , viewKinds kind
            , viewNames names name nameToMsg
            ]
        , Html.map ColorbarLimitsMsg (Colorbar.Limits.view model.limits)
        ]


type alias SelectConfig =
    { labelText : String
    , name : String
    , names : List String
    , toMsg : String -> Msg
    }


viewKinds : Palettes.Kind -> Html Msg
viewKinds kind =
    viewSelect
        { labelText = "Kind:"
        , name = "Diverging"
        , names = [ "Sequential", "Diverging", "Categorical" ]
        , toMsg =
            SetKind
                << Maybe.withDefault Palettes.sequential
                << Palettes.kindFromString
        }


viewSelect : SelectConfig -> Html Msg
viewSelect { labelText, name, names, toMsg } =
    div
        []
        [ label
            [ style "display" "block"
            , style "font-size" "0.9em"
            ]
            [ text labelText
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
                        [ text n
                        ]
                )
                names
            )
        ]


viewNames : List String -> String -> (String -> Msg) -> Html Msg
viewNames names name toMsg =
    div
        []
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


viewLevels : List Level -> Level -> (String -> Msg) -> Html Msg
viewLevels levels level toMsg =
    div []
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
                        , value (Palettes.levelToString n)
                        ]
                        [ text (Palettes.levelToString n) ]
                )
                levels
            )
        ]
