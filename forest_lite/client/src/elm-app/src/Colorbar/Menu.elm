module Colorbar.Menu exposing (Msg, update, view)

import Api.Enum.Kind exposing (Kind(..))
import ColorSchemeRequest exposing (ColorScheme)
import Colorbar
import DataVar.Select exposing (Select)
import Graphql.Http
import Helpers exposing (onSelect)
import Html exposing (Html, div, input, label, option, select, text)
import Html.Attributes exposing (attribute, for, id, selected, style, value)
import Set



-- GRAPHQL API


graphqlRequest : String -> Api.Enum.Kind.Kind -> Cmd Msg
graphqlRequest baseURL kind =
    ColorSchemeRequest.queryByKind kind
        |> Graphql.Http.queryRequest (baseURL ++ "/graphql")
        |> Graphql.Http.send GotResponse



-- UPDATE


type alias Model a =
    { a
        | baseURL : String
        , colorSchemes : List ColorScheme
        , colorSchemeKind : Maybe Api.Enum.Kind.Kind
        , colorSchemeRanks : List Int
        , colorSchemeRank : Maybe Int
    }


type Msg
    = GotKind (Maybe Api.Enum.Kind.Kind)
    | GotRank Int
    | GotResponse (Result (Graphql.Http.Error (List ColorScheme)) (List ColorScheme))


update : Msg -> Model a -> ( Model a, Cmd Msg )
update msg model =
    case msg of
        GotKind maybeKind ->
            case maybeKind of
                Just kind ->
                    let
                        cmd =
                            graphqlRequest model.baseURL kind
                    in
                    ( { model | colorSchemeKind = Just kind }, cmd )

                Nothing ->
                    ( model, Cmd.none )

        GotRank rank ->
            ( { model | colorSchemeRank = Just rank }, Cmd.none )

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
    div [ style "display" "grid" ]
        [ radioButtons { name = "kind", toMsg = toMsg }
            [ { id = "seq"
              , label = "Sequential"
              , value = Api.Enum.Kind.toString Sequential
              }
            , { id = "div"
              , label = "Diverging"
              , value = Api.Enum.Kind.toString Diverging
              }
            , { id = "qual"
              , label = "Qualitative"
              , value = Api.Enum.Kind.toString Qualitative
              }
            ]
        , dropdown []
            { names = List.map String.fromInt model.colorSchemeRanks
            , toMsg = GotRank << Maybe.withDefault 3 << String.toInt
            , label = "Select data levels"
            , name = "4"
            }
        , viewColorSchemeRank model.colorSchemeRank
        , viewColorSchemes model.colorSchemeRank model.colorSchemes
        ]


{-|

    Helper view function to debug radio buttons

-}
viewColorSchemeRank : Maybe Int -> Html Msg
viewColorSchemeRank maybeRank =
    case maybeRank of
        Nothing ->
            div [] [ text "???" ]

        Just rank ->
            div [] [ text ("Rank: " ++ String.fromInt rank) ]


viewColorSchemes : Maybe Int -> List ColorScheme -> Html Msg
viewColorSchemes maybeRank schemes =
    div [] (List.map (viewColorScheme maybeRank) schemes)


viewColorScheme : Maybe Int -> ColorScheme -> Html Msg
viewColorScheme maybeRank scheme =
    case maybeRank of
        Nothing ->
            div [] [ text scheme.name ]

        Just rank ->
            let
                content =
                    scheme.palettes
                        |> List.filter (\p -> p.rank == rank)
                        |> List.map .rgbs
                        |> List.foldr (++) []
                        |> String.join ", "
            in
            div []
                [ text scheme.name
                , div [] [ text content ]
                ]



-- RADIO BUTTON


type alias RadioAttrs =
    { toMsg : String -> Msg
    , name : String
    }


type alias RadioConfig =
    { id : String
    , label : String
    , value : String
    }


radioButtons : RadioAttrs -> List RadioConfig -> Html Msg
radioButtons attrs configs =
    div []
        (List.map
            (\config ->
                radioButton attrs.name attrs.toMsg config
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
            [ text config.label ]
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
