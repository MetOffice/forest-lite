port module Main exposing (..)

import Browser
import Dict exposing (Dict)
import Html exposing (Html, div, h1, li, optgroup, option, select, span, text, ul)
import Html.Attributes exposing (attribute, class, style)
import Http
import Json.Decode exposing (Decoder, dict, field, int, list, maybe, string)
import Json.Decode.Pipeline exposing (optional, required)


jwtDecoder : Decoder JWTClaim
jwtDecoder =
    Json.Decode.succeed JWTClaim
        |> required "auth_time" int
        |> optional "email" string "Not provided"
        |> required "name" string
        |> required "given_name" string
        |> required "family_name" string
        |> required "groups" (list string)
        |> required "iat" int
        |> required "exp" int


type alias JWTClaim =
    { auth_time : Int
    , email : String
    , name : String
    , given_name : String
    , family_name : String
    , groups : List String
    , iat : Int
    , exp : Int
    }


type alias User =
    { name : String
    , email : String
    , groups : List String
    }


type alias Model =
    { user : Maybe User
    , route : Maybe Route
    , datasets : Request
    , datasetDescriptions : Dict Int RequestDescription
    }


type alias Dataset =
    { label : String
    , id : Int
    }


type alias DatasetDescription =
    { attrs : Dict String String
    , data_vars : Dict String DataVar
    , dataset_id : Int
    }


type alias DataVar =
    { dims : List String
    , attrs : Dict String String
    }


type Request
    = Failure
    | Loading
    | Success (List Dataset)


type RequestDescription
    = FailureDescription
    | LoadingDescription
    | SuccessDescription DatasetDescription


type Route
    = Account
    | Home


type alias Flags =
    Json.Decode.Value


type Msg
    = HashReceived String
    | GotDatasets (Result Http.Error (List Dataset))
    | GotDatasetDescription (Result Http.Error DatasetDescription)



-- MAIN


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- INIT


init : Flags -> ( Model, Cmd Msg )
init flags =
    case Json.Decode.decodeValue jwtDecoder flags of
        Ok claim ->
            ( { user =
                    Just
                        { name = claim.name
                        , email = claim.email
                        , groups = claim.groups
                        }
              , route = Nothing
              , datasets = Loading
              , datasetDescriptions = Dict.empty
              }
            , getDatasets
            )

        Err err ->
            -- TODO: Support failed JSON decode in Model
            ( { user = Nothing
              , route = Nothing
              , datasets = Loading
              , datasetDescriptions = Dict.empty
              }
            , getDatasets
            )


datasetsDecoder : Decoder (List Dataset)
datasetsDecoder =
    field "datasets" (list datasetDecoder)


datasetDecoder : Decoder Dataset
datasetDecoder =
    Json.Decode.map2 Dataset
        (field "label" string)
        (field "id" int)


datasetDescriptionDecoder : Decoder DatasetDescription
datasetDescriptionDecoder =
    Json.Decode.map3
        DatasetDescription
        (field "attrs" (dict string))
        (field "data_vars" (dict dataVarDecoder))
        (field "dataset_id" int)


dataVarDecoder : Decoder DataVar
dataVarDecoder =
    Json.Decode.map2
        DataVar
        (field "dims" (list string))
        (field "attrs" (dict string))



-- PORTS


port hash : (String -> msg) -> Sub msg



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        HashReceived hashRoute ->
            ( { model | route = parseRoute hashRoute }, Cmd.none )

        GotDatasets result ->
            case result of
                Ok datasets ->
                    ( { model | datasets = Success datasets }
                    , Cmd.batch
                        (List.map (\d -> getDatasetDescription d.id)
                            datasets
                        )
                    )

                Err _ ->
                    ( { model | datasets = Failure }, Cmd.none )

        GotDatasetDescription result ->
            case result of
                Ok payload ->
                    let
                        datasetDescriptions =
                            Dict.insert payload.dataset_id (SuccessDescription payload) model.datasetDescriptions
                    in
                    ( { model | datasetDescriptions = datasetDescriptions }
                    , Cmd.none
                    )

                Err _ ->
                    ( model, Cmd.none )


getDatasets : Cmd Msg
getDatasets =
    Http.get
        { url = "http://localhost:8000/datasets"
        , expect = Http.expectJson GotDatasets datasetsDecoder
        }


getDatasetDescription : Int -> Cmd Msg
getDatasetDescription datasetId =
    Http.get
        { url = "http://localhost:8000/datasets/" ++ String.fromInt datasetId
        , expect = Http.expectJson GotDatasetDescription datasetDescriptionDecoder
        }


parseRoute : String -> Maybe Route
parseRoute hashText =
    if hashText == "#/account" then
        Just Account

    else if hashText == "#/" then
        Just Home

    else
        Nothing



-- VIEW


view : Model -> Html Msg
view model =
    case model.route of
        Just validRoute ->
            case validRoute of
                Account ->
                    viewAccountInfo model

                Home ->
                    viewHome model

        Nothing ->
            div [] []


viewHome : Model -> Html Msg
viewHome model =
    case model.datasets of
        Success datasets ->
            div [] [ viewDatasets datasets model ]

        Loading ->
            div [] [ text "..." ]

        Failure ->
            div [] [ text "failed to fetch datasets" ]


viewDatasets : List Dataset -> Model -> Html Msg
viewDatasets datasets model =
    select [] (List.map (viewDataset model) datasets)


viewDataset : Model -> Dataset -> Html Msg
viewDataset model dataset =
    let
        maybeDescription =
            Dict.get dataset.id model.datasetDescriptions
    in
    case maybeDescription of
        Just description ->
            case description of
                SuccessDescription desc ->
                    optgroup [ attribute "label" dataset.label ]
                        (List.map
                            (\v -> option [] [ text v ])
                            (Dict.keys desc.data_vars)
                        )

                FailureDescription ->
                    optgroup [ attribute "label" dataset.label ]
                        [ option [] [ text "Failed to load variables" ]
                        ]

                LoadingDescription ->
                    optgroup [ attribute "label" dataset.label ]
                        [ option [] [ text "..." ]
                        ]

        Nothing ->
            optgroup [ attribute "label" dataset.label ] []


viewAccountInfo : Model -> Html Msg
viewAccountInfo model =
    div
        [ style "display" "grid"
        , style "grid-template-columns" "1fr 1fr 1fr"
        ]
        [ div [ style "grid-column-start" "2" ]
            [ div [ class "Account__card" ]
                [ viewTitle
                , viewUser model.user
                ]
            ]
        ]


viewTitle : Html Msg
viewTitle =
    h1
        [ class "Account__h1" ]
        [ text "Account information" ]


viewUser : Maybe User -> Html Msg
viewUser maybeUser =
    case maybeUser of
        Just user ->
            div
                []
                [ viewItem "Name" user.name
                , viewItem "Contact" user.email
                , div
                    [ class "Account__item__container" ]
                    [ div [ class "Account__item__label" ]
                        [ text "Authentication groups"
                        ]
                    , div []
                        [ ul
                            [ class "Account__ul" ]
                            (List.map viewGroup user.groups)
                        ]
                    ]
                ]

        Nothing ->
            div [] [ text "Not logged in" ]


viewGroup group =
    li
        [ class "Account__li" ]
        [ text group ]


viewItem : String -> String -> Html Msg
viewItem label content =
    div
        [ class "Account__item__container" ]
        [ div
            [ class "Account__item__label" ]
            [ text label ]
        , div
            [ class "Account__item__content" ]
            [ text content ]
        ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    hash HashReceived
