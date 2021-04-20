module Colorbar.Menu exposing (Msg, update, view)

import Api.Enum.Kind exposing (Kind(..))
import ColorSchemeRequest exposing (ColorScheme, ColorSchemeName)
import Colorbar
import DataVar.Select exposing (Select)
import Graphql.Http
import Graphql.Operation exposing (RootQuery)
import Graphql.SelectionSet exposing (SelectionSet)
import Helpers exposing (onSelect)
import Html exposing (Html, div, input, label, option, select, span, text)
import Html.Attributes exposing (attribute, for, id, selected, style, value)
import Json.Decode
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



-- UPDATE


type alias Model a =
    { a
        | baseURL : String
        , colorSchemes : List ColorScheme
        , colorSchemeKind : Maybe Api.Enum.Kind.Kind
        , colorSchemeRanks : List Int
        , colorSchemeRank : Maybe Int
    }


type alias GraphqlResult a =
    Result (Graphql.Http.Error a) a


type Msg
    = GotKind (Maybe Api.Enum.Kind.Kind)
    | GotRank Int
    | GotResponse (GraphqlResult (List ColorScheme))
    | GotColorSchemeNames (GraphqlResult (List ColorSchemeName))
    | GotColors (Result Json.Decode.Error (List String))


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
                    ( { model | colorSchemeKind = Just kind }, cmd )

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
                        | colorSchemes = colorSchemes
                        , colorSchemeRanks = toRanks colorSchemes
                      }
                    , Cmd.none
                    )

                _ ->
                    ( model, Cmd.none )

        -- TODO implement update
        GotColorSchemeNames _ ->
            ( model, Cmd.none )

        -- TODO implement update
        GotColors _ ->
            ( model, Cmd.none )


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
    let
        toMsg =
            GotKind << Api.Enum.Kind.fromString

        kind =
            model.colorSchemeKind
                |> Maybe.map Api.Enum.Kind.toString
                |> Maybe.withDefault "???"
    in
    div
        [ style "display" "grid"
        , style "grid-row-gap" "0.5em"
        ]
        [ div [ style "font-size" "0.9em" ] [ text "Select nature of data" ]
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
        , dropdown []
            { names = List.map String.fromInt model.colorSchemeRanks
            , toMsg = GotRank << Maybe.withDefault 3 << String.toInt
            , label = "Select number of colors"
            , name =
                model.colorSchemeRank
                    |> Maybe.withDefault 3
                    |> String.fromInt
            }
        , viewColorSchemes model.colorSchemeRank model.colorSchemes
        ]


{-|

    Helper view function to debug radio buttons

-}
viewColorSchemes : Maybe Int -> List ColorScheme -> Html Msg
viewColorSchemes maybeRank schemes =
    case maybeRank of
        Nothing ->
            div [] [ text "Please choose data levels" ]

        Just rank ->
            let
                swatches =
                    schemes
                        |> List.filter (hasRank rank)
                        |> List.map (extractSwatch rank)

                toMsg =
                    GotColors << Json.Decode.decodeString colorsDecoder
            in
            div
                [ style "display" "grid"
                , style "grid-row-gap" "0.5em"
                ]
                (div
                    [ style "font-size" "0.9em"
                    ]
                    [ text "Select color scheme" ]
                    :: List.map (viewSwatchButton toMsg) swatches
                )


viewSwatchButton : (String -> Msg) -> List String -> Html Msg
viewSwatchButton toMsg colors =
    let
        name =
            "colors"

        swatchId =
            String.join "" colors

        swatchValue =
            ""
    in
    div [ style "display" "flex" ]
        [ input
            [ attribute "type" "radio"
            , attribute "name" name
            , id swatchId
            , value swatchValue
            , onSelect toMsg
            ]
            []
        , label
            [ for swatchId
            , style "flex-grow" "1"
            ]
            [ viewSwatch colors ]
        ]


colorsDecoder : Json.Decode.Decoder (List String)
colorsDecoder =
    Json.Decode.list Json.Decode.string


hasRank : Int -> ColorScheme -> Bool
hasRank rank scheme =
    scheme.palettes
        |> List.filter (\p -> p.rank == rank)
        |> List.isEmpty
        |> not


extractSwatch : Int -> ColorScheme -> List String
extractSwatch rank scheme =
    scheme.palettes
        |> List.filter (\p -> p.rank == rank)
        |> List.map .rgbs
        |> List.foldr (++) []


viewSwatch : List String -> Html Msg
viewSwatch colors =
    span
        [ style "display" "flex"
        , style "border" "1px solid #CCC"
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
