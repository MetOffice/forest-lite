module Colorbar.Menu exposing (Msg(..), Order(..), leftToRight, update, view)

import Api.Enum.Kind exposing (Kind(..))
import ColorSchemeRequest exposing (ColorScheme, ColorSchemeName)
import Colorbar
import DataVar.Select exposing (Select)
import Graphql.Http
import Graphql.Operation exposing (RootQuery)
import Graphql.SelectionSet exposing (SelectionSet)
import Helpers exposing (onSelect)
import Html exposing (Html, div, input, label, option, select, span, text)
import Html.Attributes exposing (attribute, checked, class, classList, for, id, selected, style, title, value)
import Html.Events exposing (onCheck)
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



-- COLOR ORDER


type Order
    = LeftToRight
    | RightToLeft


leftToRight : Order
leftToRight =
    LeftToRight


orderFromBool : Bool -> Order
orderFromBool flag =
    if flag then
        RightToLeft

    else
        LeftToRight


orderIsFlipped : Order -> Bool
orderIsFlipped order =
    case order of
        LeftToRight ->
            False

        RightToLeft ->
            True



-- UPDATE


type alias Model a =
    { a
        | baseURL : String
        , colorSchemes : Request (List ColorScheme)
        , colorSchemeKind : Maybe Api.Enum.Kind.Kind
        , colorSchemeRanks : List Int
        , colorSchemeRank : Maybe Int
        , colorSchemeName : Maybe String
        , colorSchemeOrder : Order
    }


type Name
    = Name String


type Msg
    = GotKind (Maybe Api.Enum.Kind.Kind)
    | GotRank Int
    | GotResponse (GraphqlResult (List ColorScheme))
    | GotColorSchemeNames (GraphqlResult (List ColorSchemeName))
    | GotColorScheme Name
    | SetOrder Order


update : Msg -> Model a -> ( Model a, Cmd Msg )
update msg model =
    case msg of
        GotKind maybeKind ->
            case maybeKind of
                Just kind ->
                    let
                        query =
                            ColorSchemeRequest.queryByKind kind

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
            case model.colorSchemeKind of
                Nothing ->
                    ( { model | colorSchemeRank = Just rank }, Cmd.none )

                Just kind ->
                    let
                        query =
                            ColorSchemeRequest.queryNameByKind kind

                        cmd =
                            graphqlRequest model.baseURL query GotColorSchemeNames
                    in
                    ( { model | colorSchemeRank = Just rank }, cmd )

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
        GotColorSchemeNames _ ->
            ( model, Cmd.none )

        -- TODO implement update
        GotColorScheme name ->
            case name of
                Name str ->
                    ( { model | colorSchemeName = Just str }, Cmd.none )

        SetOrder order ->
            ( { model | colorSchemeOrder = order }, Cmd.none )


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
                [ viewKindRadioButtons model
                , viewRankDropdown model
                , viewOrderButton model.colorSchemeOrder
                , viewColorSchemes model.colorSchemeName
                    model.colorSchemeRank
                    model.colorSchemeOrder
                    colorSchemes
                ]

        NotStarted ->
            div
                [ style "display" "grid"
                , style "grid-row-gap" "0.5em"
                ]
                [ viewKindRadioButtons model
                ]

        Loading ->
            div
                [ style "display" "grid"
                , style "grid-row-gap" "0.5em"
                ]
                [ viewKindRadioButtons model
                , div [] [ div [ class "spinner" ] [] ]
                ]

        Failure ->
            div
                [ style "display" "grid"
                , style "grid-row-gap" "0.5em"
                ]
                [ viewKindRadioButtons model
                , div [] [ text "Could not load color schemes" ]
                ]


viewOrderButton : Order -> Html Msg
viewOrderButton order =
    let
        buttonId =
            "reverse-btn"

        toMsg =
            SetOrder << orderFromBool
    in
    div []
        [ input
            [ attribute "type" "checkbox"
            , class "toggle"
            , id buttonId
            , onCheck toMsg
            , checked (orderIsFlipped order)
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


viewColorSchemes : Maybe String -> Maybe Int -> Order -> List ColorScheme -> Html Msg
viewColorSchemes maybeName maybeRank order schemes =
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
                    GotColorScheme << Name
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
    case order of
        LeftToRight ->
            swatch

        RightToLeft ->
            { swatch | colors = List.reverse swatch.colors }


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
