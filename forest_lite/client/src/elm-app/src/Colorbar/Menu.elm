module Colorbar.Menu exposing
    ( Msg(..)
    , Swatch
    , parseScheme
    , update
    , view
    )

import Action exposing (Action(..))
import Api.Enum.Kind exposing (Kind(..))
import ColorScheme.Colors exposing (Colors)
import ColorScheme.Name exposing (Name)
import ColorScheme.Order exposing (Order)
import ColorScheme.Rank exposing (Rank)
import ColorScheme.Request exposing (ColorScheme)
import ColorScheme.Select exposing (Selected, getName, getRank)
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

        -- All ColorSchemes
        , colorSchemes : Request (List ColorScheme)

        -- Intermediate choices
        , colorSchemeRanks : List Int

        -- Selected scheme
        , colorSchemeSelected : Selected
        , colorSchemeOrder : Order
        , colorSchemeColors : Maybe Colors
    }


type Msg
    = GotKind (Maybe Api.Enum.Kind.Kind)
    | GotRank Rank
    | SetName Name
    | GotResponse (GraphqlResult (List ColorScheme))
    | SetOrder Order


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

                        selected =
                            model.colorSchemeSelected
                                |> ColorScheme.Select.setKind kind
                    in
                    ( { model
                        | colorSchemes = Loading
                        , colorSchemeSelected = selected
                      }
                    , cmd
                    )

                Nothing ->
                    ( model, Cmd.none )

        GotRank rank ->
            let
                selected =
                    model.colorSchemeSelected
                        |> ColorScheme.Select.setRank rank

                maybeColors =
                    getColors_ selected model.colorSchemes
                        |> Maybe.map ColorScheme.Colors.fromList

                newModel =
                    { model
                        | colorSchemeSelected = selected
                    }
            in
            case maybeColors of
                Nothing ->
                    ( newModel, Cmd.none )

                Just colors ->
                    ( { newModel | colorSchemeColors = Just colors }, Cmd.none )

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

        SetName name ->
            let
                selected =
                    model.colorSchemeSelected
                        |> ColorScheme.Select.setName name

                maybeColors =
                    getColors_ selected model.colorSchemes
                        |> Maybe.map ColorScheme.Colors.fromList

                newModel =
                    { model
                        | colorSchemeSelected = selected
                    }
            in
            case maybeColors of
                Nothing ->
                    ( newModel, Cmd.none )

                Just colors ->
                    ( { newModel | colorSchemeColors = Just colors }, Cmd.none )

        SetOrder order ->
            let
                selected =
                    model.colorSchemeSelected

                maybeColors =
                    getColors_ selected model.colorSchemes
                        |> Maybe.map ColorScheme.Colors.fromList

                newModel =
                    { model
                        | colorSchemeOrder = order
                    }
            in
            case maybeColors of
                Nothing ->
                    ( newModel, Cmd.none )

                Just colors ->
                    let
                        newColors =
                            ColorScheme.Order.arrange
                                order
                                (ColorScheme.Colors.toList colors)
                                |> ColorScheme.Colors.fromList
                    in
                    ( { newModel | colorSchemeColors = Just newColors }, Cmd.none )


parseScheme : List ColorScheme -> Name -> Rank -> Maybe Swatch
parseScheme schemes name rank =
    let
        str =
            ColorScheme.Name.toString name
    in
    schemes
        |> List.filter (\s -> s.name == str)
        |> List.head
        |> Maybe.andThen (pluckRank rank)


pluckRank : Rank -> ColorScheme -> Maybe Swatch
pluckRank rank colorScheme =
    let
        n =
            ColorScheme.Rank.toInt rank

        maybeColors =
            colorScheme.palettes
                |> List.filter (\p -> p.rank == n)
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
            let
                rank =
                    getRank model.colorSchemeSelected
            in
            div
                [ style "display" "grid"
                , style "grid-row-gap" "0.5em"
                ]
                [ viewPreview model
                , viewKindRadioButtons model
                , viewRankDropdown model
                , viewOrderButton model.colorSchemeOrder
                , viewColorSchemes model.colorSchemeSelected
                    model.colorSchemeOrder
                    colorSchemes
                , viewSelected model.colorSchemeSelected
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


getColors_ : Selected -> Request (List ColorScheme) -> Maybe (List String)
getColors_ selected request =
    case request of
        Success colorschemes ->
            searchColors selected colorschemes

        _ ->
            Nothing


searchColors : Selected -> List ColorScheme -> Maybe (List String)
searchColors selected colorschemes =
    case ( getRank selected, getName selected ) of
        ( Just rank, Just name ) ->
            let
                n =
                    ColorScheme.Rank.toInt rank
            in
            colorschemes
                |> List.filter (hasName name)
                |> List.filter (hasRank rank)
                |> List.head
                |> Maybe.map .palettes
                |> Maybe.map
                    (List.filter (\p -> p.rank == n))
                |> Maybe.map
                    (List.map .rgbs)
                |> Maybe.andThen
                    List.head

        _ ->
            Nothing


viewPreview : Model a -> Html Msg
viewPreview model =
    let
        palette =
            model.colorSchemeColors
                |> Maybe.map ColorScheme.Colors.toList
                |> Maybe.withDefault [ "#FFFFFF", "#000000" ]
    in
    Colorbar.view
        { high = 1
        , low = 0
        , palette = palette
        , title = "Preview colorbar"
        }


viewSelected : ColorScheme.Select.Selected -> Html Msg
viewSelected selected =
    div [] [ text (ColorScheme.Select.toString selected) ]


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
    let
        maybeRank =
            getRank model.colorSchemeSelected

        name =
            maybeRank
                |> Maybe.map ColorScheme.Rank.toString
                |> Maybe.withDefault "3"

        toMsg =
            GotRank
                << Maybe.withDefault (ColorScheme.Rank.fromInt 3)
                << ColorScheme.Rank.fromString
    in
    dropdown []
        { names = List.map String.fromInt model.colorSchemeRanks
        , toMsg = toMsg
        , label = "Select number of colors"
        , name = name
        }


{-|

    Helper view function to debug radio buttons

-}
viewSelectColorSchemeName : Maybe Name -> Html Msg
viewSelectColorSchemeName maybeName =
    case maybeName of
        Nothing ->
            div [] [ text "Select color scheme" ]

        Just name ->
            let
                str =
                    ColorScheme.Name.toString name
            in
            div [] [ text ("Selected scheme: " ++ str) ]


viewColorSchemes : Selected -> Order -> List ColorScheme -> Html Msg
viewColorSchemes selected order schemes =
    let
        maybeRank =
            getRank selected

        maybeName =
            getName selected
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


viewSwatchButton : Maybe Name -> (String -> Msg) -> Swatch -> Html Msg
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
                |> Maybe.map ColorScheme.Name.toString
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


hasRank : Rank -> ColorScheme -> Bool
hasRank rank scheme =
    let
        n =
            ColorScheme.Rank.toInt rank
    in
    scheme.palettes
        |> List.filter (\p -> p.rank == n)
        |> List.isEmpty
        |> not


hasName : Name -> ColorScheme -> Bool
hasName name scheme =
    ColorScheme.Name.fromString scheme.name == name


extractSwatch : Rank -> ColorScheme -> Maybe Swatch
extractSwatch rank scheme =
    let
        n =
            ColorScheme.Rank.toInt rank

        maybePalette =
            scheme.palettes
                |> List.filter (\p -> p.rank == n)
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
