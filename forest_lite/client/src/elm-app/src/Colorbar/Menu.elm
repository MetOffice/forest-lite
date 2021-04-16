module Colorbar.Menu exposing (Msg, update, view)

import Api.Enum.Kind exposing (Kind(..))
import ColorSchemeRequest exposing (ColorScheme)
import Colorbar
import DataVar.Select exposing (Select)
import Graphql.Http
import Helpers exposing (onSelect)
import Html exposing (Html, div, input, label, option, select, text)
import Html.Attributes exposing (attribute, for, id, selected, style, value)



-- GRAPHQL API


graphqlRequest : String -> Cmd Msg
graphqlRequest baseURL =
    ColorSchemeRequest.queryByName "Spectral"
        |> Graphql.Http.queryRequest (baseURL ++ "/graphql")
        |> Graphql.Http.send GotResponse



-- UPDATE


type alias Model a =
    { a
        | baseURL : String
        , colorSchemes : List ColorScheme
        , colorSchemeKind : Maybe Api.Enum.Kind.Kind
    }


type Msg
    = GotKind (Maybe Api.Enum.Kind.Kind)
    | GotResponse (Result (Graphql.Http.Error (List ColorScheme)) (List ColorScheme))


update : Msg -> Model a -> ( Model a, Cmd Msg )
update msg model =
    case msg of
        GotKind kind ->
            let
                cmd =
                    graphqlRequest model.baseURL
            in
            ( { model | colorSchemeKind = kind }, cmd )

        GotResponse result ->
            case result of
                Ok colorSchemes ->
                    ( { model | colorSchemes = colorSchemes }, Cmd.none )

                _ ->
                    ( model, Cmd.none )



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
        , viewKind model.colorSchemeKind
        ]


{-|

    Helper view function to debug radio buttons

-}
viewKind : Maybe Api.Enum.Kind.Kind -> Html Msg
viewKind kind =
    let
        content =
            kind
                |> Maybe.map Api.Enum.Kind.toString
                |> Maybe.withDefault "???"
    in
    div [] [ text content ]


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
