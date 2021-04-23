module Colorbar.Menu exposing
    ( Msg(..)
    , Swatch
    , parseScheme
    , update
    , view
    )

import Action exposing (Action(..))
import Api.Enum.Kind exposing (Kind(..))
import ColorScheme.Name exposing (Name)
import ColorScheme.Order exposing (Order)
import ColorScheme.Request exposing (ColorScheme)
import Colorbar
import Graphql.Http
import Graphql.Operation exposing (RootQuery)
import Graphql.SelectionSet exposing (SelectionSet)
import Helpers exposing (onSelect)
import Html exposing (Html, div, input, label, option, select, span, text)
import Html.Attributes exposing (attribute, checked, class, classList, for, id, selected, style, title, value)
import Html.Events exposing (onCheck)
import Json.Decode exposing (Decoder)
import Json.Encode
import Ports exposing (sendAction)
import Request exposing (Request(..))
import Set



-- GRAPHQL API


graphqlRequest :
    String
    -> SelectionSet decodeTo RootQuery
    -> (Result (Graphql.Http.Error decodeTo) decodeTo -> Msg)
    -> Cmd Msg
graphqlRequest baseURL query msg =
    query
        |> Graphql.Http.queryRequest (baseURL ++ "/graphql")
        |> Graphql.Http.send msg


type alias GraphqlResult a =
    Result (Graphql.Http.Error a) a



-- UPDATE


type alias Model a =
    { a
        | baseURL : String
        , colorScheme : Maybe Swatch

        -- All ColorSchemes
        , colorSchemes : Request (List ColorScheme)

        -- Intermediate choices
        , colorSchemeKind : Maybe Api.Enum.Kind.Kind
        , colorSchemeRanks : List Int

        -- Selected scheme
        , colorSchemeName : Maybe Name
        , colorSchemeRank : Maybe Int
        , colorSchemeOrder : Order
    }


type Msg
    = GotKind (Maybe Api.Enum.Kind.Kind)
    | GotRank Int
    | GotResponse (GraphqlResult (List ColorScheme))
    | SetColorScheme (Result Json.Decode.Error Swatch)
    | SetOrder Order
    | SetName Name


update : Msg -> Model a -> ( Model a, Cmd Msg )
update msg model =
    case msg of
        GotKind maybeKind ->
            case maybeKind of
                Just kind ->
                    let
                        query =
                            ColorScheme.Request.queryByKind kind

                        cmd =
                            graphqlRequest model.baseURL query GotResponse
                    in
                    ( { model
                        | colorSchemeKind = Just kind
                        , colorSchemes = Loading
                      }
                    , cmd
                    )

                Nothing ->
                    ( model, Cmd.none )

        GotRank rank ->
            case model.colorSchemes of
                Success colorSchemes ->
                    case model.colorScheme of
                        Nothing ->
                            ( { model | colorSchemeRank = Just rank }
                            , Cmd.none
                            )

                        Just scheme ->
                            let
                                maybeScheme =
                                    parseScheme colorSchemes scheme.name rank

                                cmd =
                                    maybeScheme
                                        |> Maybe.map .colors
                                        |> Maybe.map setColorsCmd
                                        |> Maybe.withDefault Cmd.none
                            in
                            ( { model
                                | colorSchemeRank = Just rank
                                , colorScheme = maybeScheme
                              }
                            , cmd
                            )

                _ ->
                    ( { model | colorSchemeRank = Just rank }
                    , Cmd.none
                    )

        GotResponse result ->
            case result of
                Ok colorSchemes ->
                    ( { model
                        | colorSchemes = Success colorSchemes
                        , colorSchemeRanks = toRanks colorSchemes
                      }
                    , Cmd.none
                    )

                _ ->
                    ( { model | colorSchemes = Failure }, Cmd.none )

        -- TODO implement update
        SetColorScheme result ->
            case result of
                Ok scheme ->
                    let
                        cmd =
                            setColorsCmd scheme.colors
                    in
                    ( { model | colorScheme = Just scheme }, cmd )

                Err _ ->
                    ( model, Cmd.none )

        SetName name ->
            let
                newModel =
                    { model | colorSchemeName = Just name }
            in
            ( newModel, Cmd.none )

        SetOrder order ->
            case model.colorScheme of
                Nothing ->
                    ( { model | colorSchemeOrder = order }
                    , Cmd.none
                    )

                Just scheme ->
                    ( { model | colorSchemeOrder = order }
                    , setColorsCmd (ColorScheme.Order.arrange order scheme.colors)
                    )


parseScheme : List ColorScheme -> String -> Int -> Maybe Swatch
parseScheme schemes name rank =
    schemes
        |> List.filter (\s -> s.name == name)
        |> List.head
        |> Maybe.andThen (pluckRank rank)


pluckRank : Int -> ColorScheme -> Maybe Swatch
pluckRank rank colorScheme =
    let
        maybeColors =
            colorScheme.palettes
                |> List.filter (\p -> p.rank == rank)
                |> List.map .rgbs
                |> List.head
    in
    case maybeColors of
        Nothing ->
            Nothing

        Just colors ->
            Just { name = colorScheme.name, colors = colors }


setColorsCmd : List String -> Cmd Msg
setColorsCmd colors =
    SetColors colors
        |> Action.encode
        |> sendAction


toRanks : List ColorScheme -> List Int
toRanks colorSchemes =
    colorSchemes
        |> List.map .palettes
        |> List.foldr (++) []
        |> List.map .rank
        |> Set.fromList
        |> Set.toList



-- VIEW


view : Model a -> Html Msg
view model =
    case model.colorSchemes of
        Success colorSchemes ->
            div
                [ style "display" "grid"
                , style "grid-row-gap" "0.5em"
                ]
                [ viewPreview model
                , viewKindRadioButtons model
                , viewRankDropdown model
                , viewOrderButton model.colorSchemeOrder
                , viewColorSchemes model.colorScheme
                    model.colorSchemeRank
                    model.colorSchemeOrder
                    colorSchemes
                ]

        NotStarted ->
            div
                [ style "display" "grid"
                , style "grid-row-gap" "0.5em"
                ]
                [ viewPreview model
                , viewKindRadioButtons model
                ]

        Loading ->
            div
                [ style "display" "grid"
                , style "grid-row-gap" "0.5em"
                ]
                [ viewPreview model
                , viewKindRadioButtons model
                , div [] [ div [ class "spinner" ] [] ]
                ]

        Failure ->
            div
                [ style "display" "grid"
                , style "grid-row-gap" "0.5em"
                ]
                [ viewPreview model
                , viewKindRadioButtons model
                , div [] [ text "Could not load color schemes" ]
                ]


viewPreview : Model a -> Html Msg
viewPreview model =
    let
        palette =
            model.colorScheme
                |> Maybe.map .colors
                |> Maybe.map (ColorScheme.Order.arrange model.colorSchemeOrder)
                |> Maybe.withDefault [ "#FFFFFF", "#000000" ]
    in
    Colorbar.view
        { high = 1
        , low = 0
        , palette = palette
        , title = "Preview colorbar"
        }


viewOrderButton : Order -> Html Msg
viewOrderButton order =
    let
        buttonId =
            "reverse-btn"

        toMsg =
            SetOrder << ColorScheme.Order.fromBool
    in
    div []
        [ input
            [ attribute "type" "checkbox"
            , class "toggle"
            , id buttonId
            , onCheck toMsg
            , checked (ColorScheme.Order.isRightToLeft order)
            ]
            []
        , label
            [ style "font-weight" "0.9em"
            , for buttonId
            ]
            [ text "Reverse color ordering" ]
        ]


viewKindRadioButtons : Model a -> Html Msg
viewKindRadioButtons model =
    let
        toMsg =
            GotKind << Api.Enum.Kind.fromString

        kind =
            model.colorSchemeKind
                |> Maybe.map Api.Enum.Kind.toString
                |> Maybe.withDefault "???"
    in
    div []
        [ div [ style "font-size" "0.9em" ]
            [ text "Select nature of data"
            ]
        , radioButtons "kind"
            toMsg
            [ { id = "seq"
              , label = text "Sequential"
              , value = Api.Enum.Kind.toString Sequential
              }
            , { id = "div"
              , label = text "Diverging"
              , value = Api.Enum.Kind.toString Diverging
              }
            , { id = "qual"
              , label = text "Qualitative"
              , value = Api.Enum.Kind.toString Qualitative
              }
            ]
        ]


viewRankDropdown : Model a -> Html Msg
viewRankDropdown model =
    dropdown []
        { names = List.map String.fromInt model.colorSchemeRanks
        , toMsg = GotRank << Maybe.withDefault 3 << String.toInt
        , label = "Select number of colors"
        , name =
            model.colorSchemeRank
                |> Maybe.withDefault 3
                |> String.fromInt
        }


{-|

    Helper view function to debug radio buttons

-}
viewSelectColorSchemeName : Maybe String -> Html Msg
viewSelectColorSchemeName maybeName =
    case maybeName of
        Nothing ->
            div [] [ text "Select color scheme" ]

        Just str ->
            div [] [ text ("Selected scheme: " ++ str) ]


viewColorSchemes : Maybe Swatch -> Maybe Int -> Order -> List ColorScheme -> Html Msg
viewColorSchemes maybeScheme maybeRank order schemes =
    let
        maybeName =
            Maybe.map .name maybeScheme
    in
    case maybeRank of
        Nothing ->
            text ""

        Just rank ->
            let
                swatches =
                    schemes
                        |> List.filter (hasRank rank)
                        |> List.map (extractSwatch rank)
                        |> List.filterMap identity
                        |> List.map (flipSwatch order)

                toMsg =
                    SetName << ColorScheme.Name.fromString
            in
            div []
                [ div [ style "font-size" "0.9em" ]
                    [ viewSelectColorSchemeName maybeName ]
                , div
                    [ style "display" "grid"
                    , style "grid-row-gap" "0.5em"
                    , style "grid-template-columns" "1fr 1fr"
                    ]
                    (List.map (viewSwatchButton maybeName toMsg) swatches)
                ]


type alias Swatch =
    { name : String
    , colors : List String
    }


flipSwatch : Order -> Swatch -> Swatch
flipSwatch order swatch =
    { swatch | colors = ColorScheme.Order.arrange order swatch.colors }


viewSwatchButton : Maybe String -> (String -> Msg) -> Swatch -> Html Msg
viewSwatchButton maybeName toMsg swatch =
    let
        name =
            "colors"

        swatchId =
            swatch.name

        swatchValue =
            swatch.name

        isChecked =
            maybeName
                |> Maybe.map (\n -> n == swatch.name)
                |> Maybe.withDefault False
    in
    div
        [ style "display" "flex"
        , style "align-items" "center"
        ]
        [ input
            [ attribute "type" "radio"
            , attribute "name" name
            , id swatchId
            , value swatchValue
            , onSelect toMsg
            , checked isChecked
            ]
            []
        , label
            [ for swatchId
            , style "flex-grow" "1"
            ]
            [ viewSwatchColors swatch.name isChecked swatch.colors ]
        ]


hasRank : Int -> ColorScheme -> Bool
hasRank rank scheme =
    scheme.palettes
        |> List.filter (\p -> p.rank == rank)
        |> List.isEmpty
        |> not


extractSwatch : Int -> ColorScheme -> Maybe Swatch
extractSwatch rank scheme =
    let
        maybePalette =
            scheme.palettes
                |> List.filter (\p -> p.rank == rank)
                |> List.head
    in
    case maybePalette of
        Nothing ->
            Nothing

        Just palette ->
            Just { name = scheme.name, colors = palette.rgbs }


viewSwatchColors : String -> Bool -> List String -> Html Msg
viewSwatchColors hoverText isChecked colors =
    span
        [ style "display" "flex"
        , title hoverText
        , class "highlight"
        , class "pointer"
        , classList [ ( "checked", isChecked ) ]
        ]
        (List.map
            (\color ->
                span
                    [ style "background-color" color
                    , style "height" "1em"
                    , style "flex-grow" "1"
                    , style "display" "inline-block"
                    ]
                    []
            )
            colors
        )



-- RADIO BUTTON


type alias RadioConfig =
    { id : String
    , label : Html Msg
    , value : String
    }


radioButtons : String -> (String -> Msg) -> List RadioConfig -> Html Msg
radioButtons name toMsg configs =
    div []
        (List.map
            (\config ->
                radioButton name toMsg config
            )
            configs
        )


radioButton : String -> (String -> Msg) -> RadioConfig -> Html Msg
radioButton name toMsg config =
    div []
        [ input
            [ attribute "type" "radio"
            , attribute "name" name
            , id config.id
            , value config.value
            , onSelect toMsg
            ]
            []
        , label
            [ for config.id
            ]
            [ config.label ]
        ]



-- DROPDOWN


type alias DropdownConfig =
    { names : List String
    , name : String
    , toMsg : String -> Msg
    , label : String
    }


dropdown : List (Html.Attribute Msg) -> DropdownConfig -> Html Msg
dropdown attrs config =
    div attrs
        [ label
            [ style "display" "block"
            , style "font-size" "0.9em"
            ]
            [ text config.label
            ]
        , select
            [ onSelect config.toMsg
            , style "width" "100%"
            ]
            (List.map
                (\n ->
                    option
                        [ selected (n == config.name)
                        ]
                        [ text n ]
                )
                config.names
            )
        ]
