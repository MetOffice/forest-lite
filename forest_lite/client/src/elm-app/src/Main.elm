port module Main exposing (..)

import Browser
import DataVarLabel exposing (DataVarLabel)
import DatasetID exposing (DatasetID)
import Datum exposing (Datum)
import Dict exposing (Dict)
import Endpoint
import Html
    exposing
        ( Attribute
        , Html
        , button
        , div
        , fieldset
        , h1
        , h2
        , h3
        , i
        , input
        , label
        , li
        , optgroup
        , option
        , select
        , span
        , text
        , ul
        )
import Html.Attributes
    exposing
        ( attribute
        , checked
        , class
        , classList
        , for
        , id
        , style
        , value
        )
import Html.Events
    exposing
        ( on
        , onCheck
        , onClick
        , onInput
        , targetValue
        )
import Http
import Json.Decode
    exposing
        ( Decoder
        , dict
        , field
        , float
        , int
        , list
        , maybe
        , string
        )
import Json.Decode.Pipeline exposing (optional, required)
import Json.Encode
import MapExtent
    exposing
        ( Viewport
        , WGS84
        , WebMercator
        , mapViewport
        , toWGS84
        )
import MultiLine exposing (MultiLine)
import NaturalEarthFeature exposing (NaturalEarthFeature)
import Time


type alias Settings =
    { claim : Maybe JWTClaim
    , baseURL : String
    }


flagsDecoder : Decoder Settings
flagsDecoder =
    Json.Decode.map2 Settings
        (maybe (field "claim" jwtDecoder))
        (field "baseURL" string)


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


type PortMessage
    = PortHash String
    | PortAction Action


portDecoder : Decoder PortMessage
portDecoder =
    Json.Decode.field "label" Json.Decode.string
        |> Json.Decode.andThen portPayloadDecoder


portPayloadDecoder : String -> Decoder PortMessage
portPayloadDecoder label =
    case label of
        "hashchange" ->
            Json.Decode.map PortHash
                (Json.Decode.field "payload" Json.Decode.string)

        _ ->
            Json.Decode.map PortAction
                (Json.Decode.field "payload" actionDecoder)


actionDecoder : Decoder Action
actionDecoder =
    Json.Decode.field "type" Json.Decode.string
        |> Json.Decode.andThen actionPayloadDecoder


actionPayloadDecoder : String -> Decoder Action
actionPayloadDecoder label =
    case label of
        "SET_FIGURE" ->
            Json.Decode.field "payload"
                (Json.Decode.map4 SetFigure
                    (Json.Decode.field "x_range"
                        (Json.Decode.field "start" Json.Decode.float)
                    )
                    (Json.Decode.field "x_range"
                        (Json.Decode.field "end" Json.Decode.float)
                    )
                    (Json.Decode.field "y_range"
                        (Json.Decode.field "start" Json.Decode.float)
                    )
                    (Json.Decode.field "y_range"
                        (Json.Decode.field "end" Json.Decode.float)
                    )
                )

        _ ->
            Json.Decode.field "payload"
                (Json.Decode.map4 SetLimits
                    (Json.Decode.field "low" Json.Decode.float)
                    (Json.Decode.field "high" Json.Decode.float)
                    (Json.Decode.field "path" (Json.Decode.index 0 DatasetID.decoder))
                    (Json.Decode.field "path" (Json.Decode.index 1 DataVarLabel.decoder))
                )



-- MODEL


type alias Model =
    { user : Maybe User
    , route : Maybe Route
    , selected : Maybe SelectDataVar
    , datasets : Request (List Dataset)
    , datasetDescriptions : Dict Int (Request DatasetDescription)
    , dimensions : Dict String Dimension
    , point : Maybe Point
    , baseURL : String
    , visible : Bool
    , coastlines : Bool
    , coastlines_color : String
    , limits : Limits
    , collapsed : Dict String Bool
    }


type alias Limits =
    { user_input : TextLimits
    , data_source : DataLimits
    , origin : LimitOrigin
    }


type LimitOrigin
    = UserInput
    | DataSource


type TextLimits
    = TextLimits String String


type DataLimits
    = DataLimits Float Float
    | Undefined


type DatasetLabel
    = DatasetLabel String


labelToString : DatasetLabel -> String
labelToString (DatasetLabel str) =
    str


type alias Dataset =
    { label : DatasetLabel
    , id : DatasetID
    , driver : String
    , view : String
    }


type alias DatasetDescription =
    { attrs : Dict String String
    , data_vars : Dict String DataVar
    , dataset_id : DatasetID
    }


type alias DataVar =
    { dims : List String
    , attrs : Dict String String
    }


type alias Axis =
    { attrs : Dict String String
    , data : List Datum
    , data_var : String
    , dim_name : String
    }


type alias Dimension =
    { label : DimensionLabel
    , points : List Datum
    , kind : DimensionKind
    }


type alias DimensionLabel =
    String


type DimensionKind
    = Numeric
    | Temporal
    | Horizontal


type alias SelectDataVar =
    { dataset_id : DatasetID
    , data_var : DataVarLabel
    }


type alias SelectPoint =
    { dim_name : String
    , point : Datum
    }


type alias Point =
    Dict String Datum


type Request a
    = NotStarted
    | Failure
    | Loading
    | Success a


type Route
    = Account
    | Home


type alias Flags =
    Json.Decode.Value


type alias Collapsible =
    { head : Html Msg
    , body : Html Msg
    , onClick : Msg
    , active : Bool
    }


type Msg
    = PortReceived (Result Json.Decode.Error PortMessage)
    | GotNaturalEarthFeature NaturalEarthFeature (Result Http.Error MultiLine)
    | GotDatasets (Result Http.Error (List Dataset))
    | GotDatasetDescription DatasetID (Result Http.Error DatasetDescription)
    | GotAxis DatasetID (Result Http.Error Axis)
    | DataVarSelected String
    | PointSelected String
    | HideShowLayer Bool
    | HideShowCoastlines Bool
    | LowerBound String
    | UpperBound String
    | SetLimitOrigin Bool
    | CopyDataLimits Bound
    | ExpandCollapse SubMenu
    | SelectCoastlineColor String


type SubMenu
    = DatasetMenu
    | DimensionMenu
    | DisplayMenu
    | ColorbarMenu


type Bound
    = Upper
    | Lower



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
    let
        default =
            { user = Nothing
            , route = Nothing
            , selected = Nothing
            , datasets = Loading
            , datasetDescriptions = Dict.empty
            , dimensions = Dict.empty
            , point = Nothing
            , baseURL = "http://localhost:8000"
            , visible = True
            , coastlines = True
            , coastlines_color = "black"
            , limits =
                { user_input = TextLimits "0" "1"
                , data_source = Undefined
                , origin = DataSource
                }
            , collapsed =
                Dict.empty
            }
    in
    case Json.Decode.decodeValue flagsDecoder flags of
        Ok settings ->
            let
                baseURL =
                    settings.baseURL

                cmd =
                    Cmd.batch
                        [ getDatasets baseURL
                        ]
            in
            case settings.claim of
                Just claim ->
                    ( { default
                        | user =
                            Just
                                { name = claim.name
                                , email = claim.email
                                , groups = claim.groups
                                }
                        , baseURL = baseURL
                      }
                    , cmd
                    )

                Nothing ->
                    ( { default
                        | baseURL = baseURL
                      }
                    , cmd
                    )

        Err err ->
            -- TODO: Support failed JSON decode in Model
            ( default
            , Cmd.none
            )


axisDecoder : Decoder Axis
axisDecoder =
    Json.Decode.map4 Axis
        (field "attrs" attrsDecoder)
        (field "data" (list Datum.decoder))
        (field "data_var" string)
        (field "dim_name" string)


datasetsDecoder : Decoder (List Dataset)
datasetsDecoder =
    field "datasets" (list datasetDecoder)


datasetDecoder : Decoder Dataset
datasetDecoder =
    Json.Decode.map4 Dataset
        (field "label" datasetLabelDecoder)
        (field "id" DatasetID.decoder)
        (field "driver" string)
        (field "view" string)


datasetDescriptionDecoder : Decoder DatasetDescription
datasetDescriptionDecoder =
    Json.Decode.map3
        DatasetDescription
        (field "attrs" attrsDecoder)
        (field "data_vars" (dict dataVarDecoder))
        (field "dataset_id" DatasetID.decoder)


dataVarDecoder : Decoder DataVar
dataVarDecoder =
    Json.Decode.map2
        DataVar
        (field "dims" (list string))
        (field "attrs" attrsDecoder)


selectDataVarDecoder : Decoder SelectDataVar
selectDataVarDecoder =
    Json.Decode.map2
        SelectDataVar
        (field "dataset_id" DatasetID.decoder)
        (field "data_var" DataVarLabel.decoder)


attrsDecoder : Decoder (Dict String String)
attrsDecoder =
    dict (Json.Decode.oneOf [ string, Json.Decode.succeed "" ])


datasetLabelDecoder : Decoder DatasetLabel
datasetLabelDecoder =
    Json.Decode.map
        DatasetLabel
        string


selectPointDecoder : Decoder SelectPoint
selectPointDecoder =
    Json.Decode.map2
        SelectPoint
        (field "dim_name" string)
        (field "point" Datum.decoder)



-- PORTS


port receiveData : (Json.Decode.Value -> msg) -> Sub msg


port sendAction : String -> Cmd msg



-- UPDATE


insertDimension : Axis -> Model -> Model
insertDimension axis model =
    let
        key =
            axis.dim_name

        dimension =
            { label = axis.dim_name
            , points = axis.data
            , kind = parseDimensionKind axis.dim_name
            }

        dimensions =
            Dict.insert key dimension model.dimensions
    in
    { model | dimensions = dimensions }


initPoint : Axis -> Model -> Model
initPoint axis model =
    let
        dim_name =
            axis.dim_name

        maybeValue =
            List.head axis.data
    in
    case maybeValue of
        Just value ->
            case model.point of
                Just point ->
                    if Dict.member dim_name point then
                        model

                    else
                        let
                            newPoint =
                                Dict.insert dim_name value point
                        in
                        { model | point = Just newPoint }

                Nothing ->
                    let
                        container =
                            Dict.empty

                        newPoint =
                            Dict.insert dim_name value container
                    in
                    { model | point = Just newPoint }

        Nothing ->
            model


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        PortReceived result ->
            case result of
                Ok port_message ->
                    case port_message of
                        PortAction action ->
                            updateAction model action

                        PortHash routeText ->
                            ( { model | route = parseRoute routeText }, Cmd.none )

                Err _ ->
                    ( model, Cmd.none )

        -- NATURAL EARTH FEATURE
        GotNaturalEarthFeature feature result ->
            case result of
                Ok data ->
                    let
                        cmd =
                            SetNaturalEarthFeature feature data
                                |> encodeAction
                                |> sendAction
                    in
                    ( model, cmd )

                Err _ ->
                    ( model, Cmd.none )

        SelectCoastlineColor str ->
            let
                cmd =
                    SetCoastlineColor str
                        |> encodeAction
                        |> sendAction
            in
            ( { model | coastlines_color = str }, cmd )

        -- DIMENSIONS
        GotAxis dataset_id result ->
            case result of
                Ok axis ->
                    let
                        maybeDatasetLabel =
                            selectDatasetLabelById model dataset_id
                    in
                    case maybeDatasetLabel of
                        Just dataset_label ->
                            case parseDimensionKind axis.dim_name of
                                -- NOTE do not send action for lon/lat
                                Horizontal ->
                                    ( model
                                        |> insertDimension axis
                                        |> initPoint axis
                                    , Cmd.none
                                    )

                                -- Send action for other dims
                                _ ->
                                    ( model
                                        |> insertDimension axis
                                        |> initPoint axis
                                    , Cmd.batch
                                        [ SetItems
                                            { path =
                                                [ "navigate"
                                                , labelToString dataset_label
                                                , axis.data_var
                                                , axis.dim_name
                                                ]
                                            , items = axis.data
                                            }
                                            |> encodeAction
                                            |> sendAction
                                        ]
                                    )

                        Nothing ->
                            ( model
                                |> insertDimension axis
                                |> initPoint axis
                            , Cmd.none
                            )

                Err _ ->
                    ( model, Cmd.none )

        GotDatasets result ->
            case result of
                Ok datasets ->
                    let
                        actionCmd =
                            SetDatasets datasets
                                |> encodeAction
                                |> sendAction
                    in
                    ( { model | datasets = Success datasets }
                    , Cmd.batch
                        (actionCmd
                            :: List.map
                                (\d ->
                                    getDatasetDescription
                                        model.baseURL
                                        d.id
                                )
                                datasets
                        )
                    )

                Err _ ->
                    ( { model | datasets = Failure }, Cmd.none )

        GotDatasetDescription dataset_id result ->
            case result of
                Ok desc ->
                    let
                        key =
                            DatasetID.toInt dataset_id

                        datasetDescriptions =
                            Dict.insert key (Success desc) model.datasetDescriptions
                    in
                    ( { model | datasetDescriptions = datasetDescriptions }
                    , SetDatasetDescription desc
                        |> encodeAction
                        |> sendAction
                    )

                Err _ ->
                    ( model, Cmd.none )

        DataVarSelected payload ->
            case Json.Decode.decodeString selectDataVarDecoder payload of
                Ok selected ->
                    let
                        dataset_id =
                            selected.dataset_id

                        data_var =
                            DataVarLabel.toString selected.data_var

                        maybeDatasetLabel =
                            selectDatasetLabelById model dataset_id

                        maybeDims =
                            selectedDims model dataset_id data_var
                    in
                    case ( maybeDims, maybeDatasetLabel ) of
                        ( Just dims, Just dataset_label ) ->
                            let
                                only_active =
                                    { dataset = dataset_label
                                    , data_var = data_var
                                    }

                                actionCmd =
                                    SetOnlyActive only_active
                                        |> encodeAction
                                        |> sendAction
                            in
                            ( { model | selected = Just selected }
                            , Cmd.batch
                                (actionCmd
                                    :: List.map
                                        (\dim ->
                                            getAxis
                                                model.baseURL
                                                dataset_id
                                                (DataVarLabel.DataVarLabel data_var)
                                                dim
                                                Nothing
                                        )
                                        dims
                                )
                            )

                        _ ->
                            ( { model | selected = Just selected }, Cmd.none )

                Err err ->
                    ( { model | selected = Nothing }, Cmd.none )

        PointSelected payload ->
            case Json.Decode.decodeString selectPointDecoder payload of
                Ok selectPoint ->
                    let
                        maybeDatasetLabel =
                            selectDatasetLabel model

                        maybeDataVar =
                            selectDataVarLabel model
                    in
                    case ( maybeDatasetLabel, maybeDataVar ) of
                        ( Just dataset_label, Just data_var ) ->
                            let
                                path =
                                    [ "navigate"
                                    , labelToString dataset_label
                                    , DataVarLabel.toString data_var
                                    , selectPoint.dim_name
                                    ]

                                actionCmd =
                                    GoToItem { path = path, item = selectPoint.point }
                                        |> encodeAction
                                        |> sendAction
                            in
                            ( updatePoint model selectPoint
                            , Cmd.batch (actionCmd :: linkAxis model selectPoint)
                            )

                        _ ->
                            ( updatePoint model selectPoint
                            , Cmd.batch (linkAxis model selectPoint)
                            )

                Err _ ->
                    ( model, Cmd.none )

        HideShowLayer visible ->
            ( { model | visible = visible }
            , SetVisible visible
                |> encodeAction
                |> sendAction
            )

        HideShowCoastlines check ->
            ( { model | coastlines = check }
            , SetFlag check
                |> encodeAction
                |> sendAction
            )

        LowerBound inputText ->
            case model.limits.user_input of
                TextLimits lower upper ->
                    let
                        origin =
                            model.limits.origin

                        user_input =
                            TextLimits inputText upper

                        cmds =
                            limitsCmd origin user_input model.selected

                        model_limits =
                            model.limits
                    in
                    ( { model
                        | limits =
                            { model_limits
                                | user_input =
                                    user_input
                            }
                      }
                    , cmds
                    )

        UpperBound inputText ->
            case model.limits.user_input of
                TextLimits lower upper ->
                    let
                        origin =
                            model.limits.origin

                        user_input =
                            TextLimits lower inputText

                        cmds =
                            limitsCmd origin user_input model.selected

                        model_limits =
                            model.limits
                    in
                    ( { model
                        | limits =
                            { model_limits
                                | user_input =
                                    user_input
                            }
                      }
                    , cmds
                    )

        SetLimitOrigin flag ->
            let
                model_limits =
                    model.limits
            in
            if flag then
                ( { model | limits = { model_limits | origin = DataSource } }
                , setLimitOriginCmd DataSource model.limits model.selected
                )

            else
                ( { model | limits = { model_limits | origin = UserInput } }
                , setLimitOriginCmd UserInput model.limits model.selected
                )

        CopyDataLimits bound ->
            let
                user_input =
                    setBound bound model.limits.data_source model.limits.user_input

                cmds =
                    limitsCmd UserInput user_input model.selected
            in
            ( model
                |> setLimits
                    (model.limits
                        |> setUserInput user_input
                    )
            , cmds
            )

        ExpandCollapse menu ->
            let
                flag =
                    getCollapsed menu model.collapsed

                collapsed =
                    setCollapsed menu (not flag) model.collapsed
            in
            ( { model | collapsed = collapsed }, Cmd.none )


setLimits : Limits -> Model -> Model
setLimits limits model =
    { model | limits = limits }


setUserInput : TextLimits -> Limits -> Limits
setUserInput user_input limits =
    { limits | user_input = user_input }


setBound : Bound -> DataLimits -> TextLimits -> TextLimits
setBound bound data_limits (TextLimits user_low user_high) =
    let
        data_input =
            toUserInput data_limits
    in
    case data_input of
        TextLimits data_low data_high ->
            case bound of
                Upper ->
                    TextLimits user_low data_high

                Lower ->
                    TextLimits data_low user_high


setLimitOriginCmd : LimitOrigin -> Limits -> Maybe SelectDataVar -> Cmd Msg
setLimitOriginCmd origin limits maybe_select_data_var =
    case origin of
        DataSource ->
            case limits.data_source of
                Undefined ->
                    Cmd.none

                DataLimits lower upper ->
                    case maybe_select_data_var of
                        Nothing ->
                            Cmd.none

                        Just selected ->
                            SetLimits lower upper selected.dataset_id selected.data_var
                                |> encodeAction
                                |> sendAction

        UserInput ->
            case toDataLimits limits.user_input of
                Undefined ->
                    Cmd.none

                DataLimits lower upper ->
                    case maybe_select_data_var of
                        Nothing ->
                            Cmd.none

                        Just selected ->
                            SetLimits lower upper selected.dataset_id selected.data_var
                                |> encodeAction
                                |> sendAction


limitsCmd : LimitOrigin -> TextLimits -> Maybe SelectDataVar -> Cmd Msg
limitsCmd origin text_limits maybe_select_data_var =
    case origin of
        DataSource ->
            Cmd.none

        UserInput ->
            case toDataLimits text_limits of
                Undefined ->
                    Cmd.none

                DataLimits lower upper ->
                    case maybe_select_data_var of
                        Nothing ->
                            Cmd.none

                        Just selected ->
                            SetLimits lower upper selected.dataset_id selected.data_var
                                |> encodeAction
                                |> sendAction


toDataLimits : TextLimits -> DataLimits
toDataLimits (TextLimits lowerText upperText) =
    let
        maybeLower =
            String.toFloat lowerText

        maybeUpper =
            String.toFloat upperText
    in
    case ( maybeLower, maybeUpper ) of
        ( Just lower, Just upper ) ->
            DataLimits lower upper

        _ ->
            Undefined


toUserInput : DataLimits -> TextLimits
toUserInput data_source =
    case data_source of
        Undefined ->
            TextLimits "0" "1"

        DataLimits low high ->
            TextLimits (String.fromFloat low) (String.fromFloat high)



-- Interpret Redux actions


updateAction : Model -> Action -> ( Model, Cmd Msg )
updateAction model action =
    case action of
        SetFigure x_start x_end y_start y_end ->
            let
                start =
                    { x = x_start
                    , y = y_start
                    }

                end =
                    { x = x_end
                    , y = y_end
                    }

                map_extent =
                    Just (MapExtent.Viewport start end)

                cmd =
                    Cmd.batch
                        [ getNaturalEarthFeature
                            model.baseURL
                            NaturalEarthFeature.Coastline
                            map_extent
                        , getNaturalEarthFeature
                            model.baseURL
                            NaturalEarthFeature.Border
                            map_extent
                        , getNaturalEarthFeature
                            model.baseURL
                            NaturalEarthFeature.DisputedBorder
                            map_extent
                        , getNaturalEarthFeature
                            model.baseURL
                            NaturalEarthFeature.Lake
                            map_extent
                        ]
            in
            ( model, cmd )

        SetLimits low high _ _ ->
            let
                model_limits =
                    model.limits

                cmds =
                    setLimitsCmds model.limits.origin action
            in
            ( { model | limits = { model_limits | data_source = DataLimits low high } }
            , cmds
            )

        _ ->
            ( model
            , action
                |> encodeAction
                |> sendAction
            )


setLimitsCmds : LimitOrigin -> Action -> Cmd Msg
setLimitsCmds origin action =
    case origin of
        UserInput ->
            Cmd.none

        DataSource ->
            action
                |> encodeAction
                |> sendAction



-- Logic to request time axis if start_time axis changes


linkAxis : Model -> SelectPoint -> List (Cmd Msg)
linkAxis model selectPoint =
    let
        dataset_id =
            selectDatasetId model

        data_var =
            selectDataVarLabel model

        dim =
            "time"

        start_time =
            selectPoint.point
    in
    if selectPoint.dim_name == "start_time" then
        case ( dataset_id, data_var ) of
            ( Just dataset_id_, Just data_var_ ) ->
                [ getAxis model.baseURL dataset_id_ data_var_ dim (Just start_time)
                ]

            _ ->
                []

    else
        []


updatePoint : Model -> SelectPoint -> Model
updatePoint model selectPoint =
    let
        key =
            selectPoint.dim_name

        value =
            selectPoint.point
    in
    case model.point of
        Just modelPoint ->
            let
                point =
                    Dict.insert key value modelPoint
            in
            { model | point = Just point }

        Nothing ->
            let
                container =
                    Dict.empty

                point =
                    Dict.insert key value container
            in
            { model | point = Just point }


getNaturalEarthFeature : String -> NaturalEarthFeature -> Maybe (Viewport WebMercator) -> Cmd Msg
getNaturalEarthFeature baseURL feature map_extent =
    case map_extent of
        Just viewport ->
            let
                endpoint =
                    NaturalEarthFeature.endpoint feature
                        (mapViewport toWGS84 viewport)

                tagger =
                    GotNaturalEarthFeature feature
            in
            Http.get
                { url = baseURL ++ endpoint
                , expect = Http.expectJson tagger MultiLine.decoder
                }

        Nothing ->
            Cmd.none


getDatasets : String -> Cmd Msg
getDatasets baseURL =
    let
        endpoint =
            Endpoint.Datasets
    in
    Http.get
        { url = baseURL ++ Endpoint.toString endpoint
        , expect = Http.expectJson GotDatasets datasetsDecoder
        }


getDatasetDescription : String -> DatasetID -> Cmd Msg
getDatasetDescription baseURL id =
    let
        endpoint =
            Endpoint.DatasetDescription id
    in
    Http.get
        { url = baseURL ++ Endpoint.toString endpoint
        , expect = Http.expectJson (GotDatasetDescription id) datasetDescriptionDecoder
        }


getAxis : String -> DatasetID -> DataVarLabel -> String -> Maybe Datum -> Cmd Msg
getAxis baseURL dataset_id data_var_label dim maybeStartTime =
    let
        data_var =
            DataVarLabel.toString data_var_label

        endpoint =
            Endpoint.Axis dataset_id data_var dim maybeStartTime
    in
    Http.get
        { url = baseURL ++ Endpoint.toString endpoint
        , expect = Http.expectJson (GotAxis dataset_id) axisDecoder
        }


parseRoute : String -> Maybe Route
parseRoute hashText =
    if hashText == "#/account" then
        Just Account

    else if hashText == "#/" then
        Just Home

    else
        Nothing


parseDimensionKind : String -> DimensionKind
parseDimensionKind dim_name =
    if String.contains "time" dim_name then
        Temporal

    else if String.contains "latitude" dim_name then
        Horizontal

    else if String.contains "longitude" dim_name then
        Horizontal

    else
        Numeric



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
    viewLayerMenu model


viewLimits : Limits -> Html Msg
viewLimits limits =
    case limits.origin of
        UserInput ->
            viewUserLimits limits.user_input

        DataSource ->
            viewSourceLimits limits.data_source


viewFollowCheckbox : LimitOrigin -> Html Msg
viewFollowCheckbox origin =
    let
        flag =
            origin == DataSource
    in
    label [ style "display" "block" ]
        [ input
            [ attribute "type" "checkbox"
            , checked flag
            , onCheck SetLimitOrigin
            ]
            []
        , text "Follow data limits"
        ]


viewSourceLimits : DataLimits -> Html Msg
viewSourceLimits limits =
    case limits of
        DataLimits lower upper ->
            div [ class "Limits__container" ]
                [ div [ class "Limits__label" ] [ text "Lower limit:" ]
                , div [] [ text (String.fromFloat lower) ]
                , div [ class "Limits__section" ]
                    [ div [ class "Limits__label" ]
                        [ text "Upper limit:"
                        ]
                    , div [] [ text (String.fromFloat upper) ]
                    ]
                , viewFollowCheckbox DataSource
                ]

        Undefined ->
            div [ class "Limits__container" ]
                [ div [] [ text "Data extent not available" ]
                ]


viewUserLimits : TextLimits -> Html Msg
viewUserLimits (TextLimits lower upper) =
    div []
        [ div [ class "Limits__input" ]
            [ label [ class "Limits__label" ] [ text "Low:" ]
            , input [ value lower, onInput LowerBound ] []
            , viewCopyDataButton (CopyDataLimits Lower)
            , viewBoundWarning lower
            ]
        , div [ class "Limits__input" ]
            [ label [ class "Limits__label" ] [ text "High:" ]
            , input [ value upper, onInput UpperBound ] []
            , viewCopyDataButton (CopyDataLimits Upper)
            , viewBoundWarning upper
            ]
        , viewLimitsWarning (TextLimits lower upper)
        , viewFollowCheckbox UserInput
        ]


viewCopyDataButton : Msg -> Html Msg
viewCopyDataButton tagger =
    button [ onClick tagger ]
        [ i [ class "far fa-chart-bar" ] []
        ]


viewLimitsWarning : TextLimits -> Html Msg
viewLimitsWarning limits =
    case toDataLimits limits of
        DataLimits lower upper ->
            if lower >= upper then
                div [ class "Limits__warning" ] [ text "high must be greater than low" ]

            else
                text ""

        Undefined ->
            text ""


viewBoundWarning : String -> Html Msg
viewBoundWarning bound =
    case String.toFloat bound of
        Just value ->
            text ""

        Nothing ->
            div [ class "Limits__warning" ] [ text "please enter a valid number" ]


viewLayerMenu : Model -> Html Msg
viewLayerMenu model =
    case model.datasets of
        Success datasets ->
            div []
                -- Select collection
                [ viewCollapse
                    { active = getCollapsed DatasetMenu model.collapsed
                    , head = text "Forecast/Observations"
                    , body = viewDatasets datasets model
                    , onClick = ExpandCollapse DatasetMenu
                    }

                -- Navigate dimensions
                , viewCollapse
                    { active = getCollapsed DimensionMenu model.collapsed
                    , head = text "Navigation"
                    , body = viewSelected model
                    , onClick = ExpandCollapse DimensionMenu
                    }

                -- Configure display
                , viewCollapse
                    { active = getCollapsed DisplayMenu model.collapsed
                    , head = text "Display settings"
                    , body =
                        div []
                            [ viewHideShowIcon model.visible
                            , viewCoastlineCheckbox model.coastlines
                            , viewCoastlineColorPicker model.coastlines_color
                            ]
                    , onClick = ExpandCollapse DisplayMenu
                    }

                -- Configure colorbar
                , viewCollapse
                    { active = getCollapsed ColorbarMenu model.collapsed
                    , head = text "Colorbar settings"
                    , body = viewLimits model.limits
                    , onClick = ExpandCollapse ColorbarMenu
                    }
                ]

        Loading ->
            div [] [ text "..." ]

        Failure ->
            div [] [ text "failed to fetch datasets" ]

        NotStarted ->
            div [] [ text "..." ]


getCollapsed : SubMenu -> Dict String Bool -> Bool
getCollapsed menu collapsed =
    let
        key =
            subMenuToString menu
    in
    Maybe.withDefault False (Dict.get key collapsed)


setCollapsed : SubMenu -> Bool -> Dict String Bool -> Dict String Bool
setCollapsed menu flag collapsed =
    let
        key =
            subMenuToString menu
    in
    Dict.insert key flag collapsed


subMenuToString : SubMenu -> String
subMenuToString menu =
    case menu of
        DatasetMenu ->
            "dataset"

        DimensionMenu ->
            "dimension"

        DisplayMenu ->
            "display"

        ColorbarMenu ->
            "colorbar"


viewCollapse : Collapsible -> Html Msg
viewCollapse collapse =
    div
        [ classList
            [ ( "Sidebar__section", True )
            ]
        ]
        [ div
            [ onClick collapse.onClick
            , classList
                [ ( "Collapse__trigger", True )
                , ( "Collapse__trigger--active", collapse.active )
                ]
            ]
            [ h3
                [ classList
                    [ ( "Collapse__anchor", True )
                    , ( "Collapse__anchor--active", collapse.active )
                    ]
                ]
                [ collapse.head ]
            ]
        , div
            [ classList
                [ ( "Collapse__target--active", collapse.active )
                , ( "Collapse__target", True )
                ]
            ]
            [ collapse.body
            ]
        ]


viewSelectedPoint : Maybe Point -> Html Msg
viewSelectedPoint maybePoint =
    case maybePoint of
        Just point ->
            div [] (List.map viewKeyValue (Dict.toList point))

        Nothing ->
            div [] []


viewKeyValue : ( String, Datum ) -> Html Msg
viewKeyValue ( key, value ) =
    case parseDimensionKind key of
        Numeric ->
            div []
                [ div [] [ text (key ++ ":") ]
                , div [ style "margin" "0.5em" ] [ text (Datum.toString value) ]
                ]

        Temporal ->
            div []
                [ div [] [ text (key ++ ":") ]
                , div [ style "margin" "0.5em" ] [ text (formatTime (Datum.toInt value)) ]
                ]

        Horizontal ->
            text ""


viewDatasets : List Dataset -> Model -> Html Msg
viewDatasets datasets model =
    div []
        [ div [ class "select__container" ]
            [ viewDatasetLabel model
            , select
                [ onSelect DataVarSelected
                , class "select__select"
                ]
                (List.map (viewDataset model) datasets)
            ]
        ]


viewDatasetLabel : Model -> Html Msg
viewDatasetLabel model =
    case selectDatasetLabel model of
        Just dataset_label ->
            label [ class "select__label" ]
                [ text ("Dataset: " ++ labelToString dataset_label)
                ]

        Nothing ->
            label [ class "select__label" ] [ text "Dataset:" ]


viewDataset : Model -> Dataset -> Html Msg
viewDataset model dataset =
    let
        dataset_label =
            labelToString dataset.label

        maybeDescription =
            Dict.get (DatasetID.toInt dataset.id) model.datasetDescriptions
    in
    case maybeDescription of
        Just description ->
            case description of
                Success desc ->
                    optgroup [ attribute "label" dataset_label ]
                        (List.map
                            (\v ->
                                option
                                    [ attribute "value"
                                        (dataVarToString
                                            { data_var = DataVarLabel.DataVarLabel v
                                            , dataset_id = dataset.id
                                            }
                                        )
                                    ]
                                    [ text v ]
                            )
                            (Dict.keys desc.data_vars)
                        )

                Failure ->
                    optgroup [ attribute "label" dataset_label ]
                        [ option [] [ text "Failed to load variables" ]
                        ]

                Loading ->
                    optgroup [ attribute "label" dataset_label ]
                        [ option [] [ text "..." ]
                        ]

                NotStarted ->
                    optgroup [ attribute "label" dataset_label ]
                        [ option [] [ text "..." ]
                        ]

        Nothing ->
            optgroup [ attribute "label" dataset_label ] []


viewHideShowIcon : Bool -> Html Msg
viewHideShowIcon flag =
    let
        inputId =
            "layer-visibility"
    in
    div []
        [ fieldset []
            [ input
                [ attribute "type" "checkbox"
                , checked flag
                , onCheck HideShowLayer
                , id inputId
                ]
                []
            , label
                [ for inputId
                , style "cursor" "pointer"
                , style "padding-left" "0.4em"
                ]
                [ text "Show layer" ]
            ]
        ]


viewCoastlineCheckbox : Bool -> Html Msg
viewCoastlineCheckbox flag =
    let
        inputId =
            "coastline"
    in
    div []
        [ fieldset []
            [ input
                [ attribute "type" "checkbox"
                , checked flag
                , onCheck HideShowCoastlines
                , id inputId
                ]
                []
            , label
                [ for inputId
                , style "cursor" "pointer"
                , style "padding-left" "0.4em"
                ]
                [ text "Show coastlines" ]
            ]
        ]


viewCoastlineColorPicker : String -> Html Msg
viewCoastlineColorPicker str =
    let
        inputId =
            "coastline-color"
    in
    div
        [ style "margin-top" "0.3em"
        ]
        [ div
            [ style "border-radius" "4px"
            , style "overflow" "hidden"
            , style "width" "13px"
            , style "height" "13px"
            , style "display" "inline-block"
            , style "margin" "0 0.5em"
            , style "border" "1px solid #333"
            ]
            [ input
                [ attribute "type" "color"
                , value str
                , onSelect SelectCoastlineColor
                , id inputId
                , style "background-color" "white"
                , style "border" "none"
                , style "padding" "0"
                , style "cursor" "pointer"
                , style "width" "200%"
                , style "height" "200%"
                , style "transform" "translate(-25%,-25%)"
                ]
                []
            ]
        , label
            [ for inputId
            , style "cursor" "pointer"
            ]
            [ text "Choose coastline color" ]
        ]



-- ACTIONS (React-Redux JS interop)
-- JSON encoders to simulate action creators, only needed while migrating


type Action
    = SetDatasets (List Dataset)
    | SetDatasetDescription DatasetDescription
    | SetOnlyActive OnlyActive
    | SetItems Items
    | GoToItem Item
    | SetVisible Bool
    | SetFlag Bool
    | SetLimits Float Float DatasetID DataVarLabel
    | SetNaturalEarthFeature NaturalEarthFeature MultiLine
    | SetCoastlineColor String
    | SetFigure Float Float Float Float


type alias OnlyActive =
    { dataset : DatasetLabel, data_var : String }


type alias Items =
    { path : List String, items : List Datum }


type alias Item =
    { path : List String, item : Datum }


encodeAction : Action -> String
encodeAction action =
    case action of
        SetFigure x_start x_end y_start y_end ->
            buildAction "SET_FIGURE"
                (Json.Encode.object
                    [ ( "x_range"
                      , Json.Encode.object
                            [ ( "start", Json.Encode.float x_start )
                            , ( "end", Json.Encode.float x_end )
                            ]
                      )
                    , ( "y_range"
                      , Json.Encode.object
                            [ ( "start", Json.Encode.float y_start )
                            , ( "end", Json.Encode.float y_end )
                            ]
                      )
                    ]
                )

        SetNaturalEarthFeature feature data ->
            buildAction "SET_NATURAL_EARTH_FEATURE"
                (Json.Encode.object
                    [ ( "feature", NaturalEarthFeature.encode feature )
                    , ( "data", MultiLine.encode data )
                    ]
                )

        SetCoastlineColor color ->
            buildAction "SET_COASTLINES_COLOR"
                (Json.Encode.string color)

        SetDatasets datasets ->
            buildAction "SET_DATASETS"
                (Json.Encode.list encodeDataset datasets)

        SetDatasetDescription payload ->
            buildAction "SET_DATASET_DESCRIPTION"
                (encodeDatasetDescription payload)

        SetOnlyActive active ->
            buildAction "SET_ONLY_ACTIVE"
                (encodeOnlyActive active)

        SetItems items ->
            buildAction "SET_ITEMS"
                (encodeItems items)

        GoToItem item ->
            buildAction "GOTO_ITEM"
                (encodeItem item)

        SetVisible flag ->
            buildAction "SET_VISIBLE"
                (Json.Encode.bool flag)

        SetFlag flag ->
            buildAction "SET_FLAG"
                (Json.Encode.object
                    [ ( "coastlines", Json.Encode.bool flag )
                    ]
                )

        SetLimits lower upper dataset_id datavar ->
            buildAction "SET_LIMITS"
                (Json.Encode.object
                    [ ( "high", Json.Encode.float upper )
                    , ( "low", Json.Encode.float lower )
                    , ( "path", encodeLimitPath dataset_id datavar )
                    ]
                )


buildAction : String -> Json.Encode.Value -> String
buildAction key payload =
    Json.Encode.encode 0
        (Json.Encode.object
            [ ( "type", Json.Encode.string key )
            , ( "payload", payload )
            ]
        )


encodeLimitPath : DatasetID -> DataVarLabel -> Json.Encode.Value
encodeLimitPath dataset_id data_var =
    Json.Encode.list identity
        [ DatasetID.encode dataset_id
        , DataVarLabel.encode data_var
        ]


encodeDataset : Dataset -> Json.Encode.Value
encodeDataset dataset =
    Json.Encode.object
        [ ( "id", DatasetID.encode dataset.id )
        , ( "driver", Json.Encode.string dataset.driver )
        , ( "label", Json.Encode.string (labelToString dataset.label) )
        , ( "view", Json.Encode.string dataset.view )
        ]


encodeDatasetDescription : DatasetDescription -> Json.Encode.Value
encodeDatasetDescription description =
    Json.Encode.object
        [ ( "datasetId", DatasetID.encode description.dataset_id )
        , ( "data", encodeData description )
        ]


encodeData : DatasetDescription -> Json.Encode.Value
encodeData desc =
    Json.Encode.object
        [ ( "attrs", encodeAttrs desc.attrs )
        , ( "dataset_id", DatasetID.encode desc.dataset_id )
        , ( "data_vars", Json.Encode.dict identity encodeDataVar desc.data_vars )
        ]


encodeDataVar : DataVar -> Json.Encode.Value
encodeDataVar data_var =
    Json.Encode.object
        [ ( "attrs", encodeAttrs data_var.attrs )
        , ( "dims", Json.Encode.list Json.Encode.string data_var.dims )
        ]


encodeAttrs : Dict String String -> Json.Encode.Value
encodeAttrs attrs =
    Json.Encode.dict identity Json.Encode.string attrs


encodeOnlyActive : OnlyActive -> Json.Encode.Value
encodeOnlyActive only_active =
    Json.Encode.object
        [ ( "dataset", Json.Encode.string (labelToString only_active.dataset) )
        , ( "data_var", Json.Encode.string only_active.data_var )
        ]


encodeItems : Items -> Json.Encode.Value
encodeItems items =
    Json.Encode.object
        [ ( "path", Json.Encode.list Json.Encode.string items.path )
        , ( "items", Json.Encode.list Datum.encode items.items )
        ]


encodeItem : Item -> Json.Encode.Value
encodeItem item =
    Json.Encode.object
        [ ( "path", Json.Encode.list Json.Encode.string item.path )
        , ( "item", Datum.encode item.item )
        ]



-- JSON ENCODERS


dataVarToString : SelectDataVar -> String
dataVarToString props =
    Json.Encode.encode 0
        (Json.Encode.object
            [ ( "dataset_id", DatasetID.encode props.dataset_id )
            , ( "data_var", DataVarLabel.encode props.data_var )
            ]
        )


pointToString : SelectPoint -> String
pointToString props =
    Json.Encode.encode 0
        (Json.Encode.object
            [ ( "dim_name", Json.Encode.string props.dim_name )
            , ( "point", Datum.encode props.point )
            ]
        )


viewSelected : Model -> Html Msg
viewSelected model =
    case model.selected of
        Just payload ->
            let
                dataset_id =
                    DatasetID.toInt payload.dataset_id

                maybeDesc =
                    Dict.get dataset_id model.datasetDescriptions
            in
            case maybeDesc of
                Just request ->
                    case request of
                        Success desc ->
                            let
                                key =
                                    DataVarLabel.toString payload.data_var

                                maybeVar =
                                    Dict.get key desc.data_vars
                            in
                            case maybeVar of
                                Just var ->
                                    viewDims (List.map (selectDimension model) var.dims)

                                Nothing ->
                                    text "No dims found"

                        NotStarted ->
                            text "..."

                        Loading ->
                            text "..."

                        Failure ->
                            text "Failed to load description"

                Nothing ->
                    text "No description found"

        Nothing ->
            text "Nothing selected"


selectDatasetId : Model -> Maybe DatasetID
selectDatasetId model =
    case model.selected of
        Just selected ->
            Just selected.dataset_id

        Nothing ->
            Nothing


selectDatasetLabel : Model -> Maybe DatasetLabel
selectDatasetLabel model =
    case selectDatasetId model of
        Just dataset_id ->
            selectDatasetLabelById model dataset_id

        Nothing ->
            Nothing


selectDatasetLabelById : Model -> DatasetID -> Maybe DatasetLabel
selectDatasetLabelById model dataset_id =
    case model.datasets of
        Success datasets ->
            datasets
                |> List.filter (matchId dataset_id)
                |> List.head
                |> asDatasetLabel

        _ ->
            Nothing


matchId : DatasetID -> Dataset -> Bool
matchId dataset_id dataset =
    dataset.id == dataset_id


asDatasetLabel : Maybe Dataset -> Maybe DatasetLabel
asDatasetLabel maybeDataset =
    case maybeDataset of
        Just dataset ->
            Just dataset.label

        Nothing ->
            Nothing


selectDataVarLabel : Model -> Maybe DataVarLabel
selectDataVarLabel model =
    case model.selected of
        Just selected ->
            Just selected.data_var

        Nothing ->
            Nothing


selectDimension : Model -> String -> Dimension
selectDimension model dim_name =
    let
        maybeDimension =
            Dict.get dim_name model.dimensions
    in
    case maybeDimension of
        Just dimension ->
            dimension

        Nothing ->
            { label = dim_name, points = [], kind = Numeric }


selectedDims : Model -> DatasetID -> String -> Maybe (List String)
selectedDims model dataset_id data_var =
    let
        key =
            DatasetID.toInt dataset_id

        maybeDesc =
            Dict.get key model.datasetDescriptions
    in
    case maybeDesc of
        Just request ->
            case request of
                Success desc ->
                    let
                        maybeVar =
                            Dict.get data_var desc.data_vars
                    in
                    case maybeVar of
                        Just var ->
                            Just var.dims

                        Nothing ->
                            Nothing

                NotStarted ->
                    Nothing

                Loading ->
                    Nothing

                Failure ->
                    Nothing

        Nothing ->
            Nothing


viewDims : List Dimension -> Html Msg
viewDims dims =
    div [] (List.map viewDim dims)


viewDim : Dimension -> Html Msg
viewDim dim =
    case dim.kind of
        Horizontal ->
            text ""

        _ ->
            div [ class "select__container" ]
                [ label [ class "select__label" ] [ text ("Dimension: " ++ dim.label) ]
                , div
                    []
                    [ select
                        [ onSelect PointSelected
                        , class "select__select"
                        ]
                        (List.map (viewPoint dim) dim.points)
                    ]
                ]


viewPoint : Dimension -> Datum -> Html Msg
viewPoint dim point =
    let
        kind =
            dim.kind

        dim_name =
            dim.label

        value =
            pointToString { dim_name = dim_name, point = point }
    in
    case kind of
        Numeric ->
            option [ attribute "value" value ] [ text (Datum.toString point) ]

        Temporal ->
            option [ attribute "value" value ] [ text (formatTime (Datum.toInt point)) ]

        Horizontal ->
            option [ attribute "value" value ] [ text (Datum.toString point) ]


formatTime : Int -> String
formatTime millis =
    let
        posix =
            Time.millisToPosix millis

        year =
            String.fromInt (Time.toYear Time.utc posix)

        month =
            formatMonth (Time.toMonth Time.utc posix)

        day =
            String.fromInt (Time.toDay Time.utc posix)

        hour =
            String.padLeft 2 '0' (String.fromInt (Time.toHour Time.utc posix))

        minute =
            String.padLeft 2 '0' (String.fromInt (Time.toMinute Time.utc posix))

        date =
            String.join " " [ year, month, day ]

        time =
            String.join ":" [ hour, minute ]

        zone =
            "UTC"
    in
    String.join " " [ date, time, zone ]


formatMonth : Time.Month -> String
formatMonth month =
    case month of
        Time.Jan ->
            "January"

        Time.Feb ->
            "February"

        Time.Mar ->
            "March"

        Time.Apr ->
            "April"

        Time.May ->
            "May"

        Time.Jun ->
            "June"

        Time.Jul ->
            "July"

        Time.Aug ->
            "August"

        Time.Sep ->
            "September"

        Time.Oct ->
            "October"

        Time.Nov ->
            "November"

        Time.Dec ->
            "December"



-- Select on "change" event


onSelect : (String -> msg) -> Attribute msg
onSelect tagger =
    on "change" (Json.Decode.map tagger targetValue)



-- Account info component


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
    receiveData (Json.Decode.decodeValue portDecoder >> PortReceived)
