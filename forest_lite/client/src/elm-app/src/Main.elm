port module Main exposing (..)

import Browser
import Dict exposing (Dict)
import Html
    exposing
        ( Attribute
        , Html
        , button
        , div
        , fieldset
        , h1
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
import Html.Attributes exposing (attribute, checked, class, style)
import Html.Events
    exposing
        ( on
        , onCheck
        , onClick
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
    , tab : Tab
    }


type DatasetID
    = DatasetID Int


type DatasetLabel
    = DatasetLabel String


idToInt : DatasetID -> Int
idToInt (DatasetID n) =
    n


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


type alias DataVarLabel =
    String


type DimensionKind
    = Numeric
    | Temporal
    | Horizontal


type Datum
    = Discrete Int
    | Continuous Float


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


type alias Query =
    { start_time : Datum }


type Request a
    = Failure
    | Loading
    | Success a


type Route
    = Account
    | Home


type alias Flags =
    Json.Decode.Value


type Tab
    = LayerTab
    | AdvancedTab


type Msg
    = HashReceived String
    | GotDatasets (Result Http.Error (List Dataset))
    | GotDatasetDescription DatasetID (Result Http.Error DatasetDescription)
    | GotAxis DatasetID (Result Http.Error Axis)
    | DataVarSelected String
    | PointSelected String
    | HideShowLayer
    | HideShowCoastlines Bool
    | ChooseTab Tab



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
            , tab = LayerTab
            }
    in
    case Json.Decode.decodeValue flagsDecoder flags of
        Ok settings ->
            let
                baseURL =
                    settings.baseURL
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
                    , getDatasets baseURL
                    )

                Nothing ->
                    ( { default
                        | baseURL = baseURL
                      }
                    , getDatasets baseURL
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
        (field "data" (list datumDecoder))
        (field "data_var" string)
        (field "dim_name" string)


datumDecoder : Decoder Datum
datumDecoder =
    Json.Decode.oneOf
        [ Json.Decode.map Discrete int
        , Json.Decode.map Continuous float
        ]


datasetsDecoder : Decoder (List Dataset)
datasetsDecoder =
    field "datasets" (list datasetDecoder)


datasetDecoder : Decoder Dataset
datasetDecoder =
    Json.Decode.map4 Dataset
        (field "label" datasetLabelDecoder)
        (field "id" datasetIDDecoder)
        (field "driver" string)
        (field "view" string)


datasetDescriptionDecoder : Decoder DatasetDescription
datasetDescriptionDecoder =
    Json.Decode.map3
        DatasetDescription
        (field "attrs" attrsDecoder)
        (field "data_vars" (dict dataVarDecoder))
        (field "dataset_id" datasetIDDecoder)


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
        (field "dataset_id" datasetIDDecoder)
        (field "data_var" string)


datasetIDDecoder : Decoder DatasetID
datasetIDDecoder =
    Json.Decode.map
        DatasetID
        int


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
        (field "point" datumDecoder)



-- PORTS


port hash : (String -> msg) -> Sub msg


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
        HashReceived hashRoute ->
            ( { model | route = parseRoute hashRoute }, Cmd.none )

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
                            idToInt dataset_id

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
                            selected.data_var

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
                                                data_var
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
                                    , data_var
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

        HideShowLayer ->
            let
                visible =
                    not model.visible
            in
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

        ChooseTab tab ->
            ( { model | tab = tab }, Cmd.none )



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


getDatasets : String -> Cmd Msg
getDatasets baseURL =
    Http.get
        { url = baseURL ++ "/datasets"
        , expect = Http.expectJson GotDatasets datasetsDecoder
        }


getDatasetDescription : String -> DatasetID -> Cmd Msg
getDatasetDescription baseURL datasetId =
    Http.get
        { url = baseURL ++ "/datasets/" ++ String.fromInt (idToInt datasetId)
        , expect = Http.expectJson (GotDatasetDescription datasetId) datasetDescriptionDecoder
        }


getAxis : String -> DatasetID -> DataVarLabel -> String -> Maybe Datum -> Cmd Msg
getAxis baseURL dataset_id data_var dim maybeStartTime =
    Http.get
        { url = formatAxisURL baseURL dataset_id data_var dim maybeStartTime
        , expect = Http.expectJson (GotAxis dataset_id) axisDecoder
        }


formatAxisURL : String -> DatasetID -> String -> String -> Maybe Datum -> String
formatAxisURL baseURL dataset_id data_var dim maybeStartTime =
    let
        path =
            String.join "/"
                [ baseURL
                , "datasets"
                , String.fromInt (idToInt dataset_id)
                , data_var
                , "axis"
                , dim
                ]
    in
    case maybeStartTime of
        Just start_time ->
            path ++ "?query=" ++ queryToString { start_time = start_time }

        Nothing ->
            path


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
    viewTab model



-- TAB LAYOUT


viewTab : Model -> Html Msg
viewTab model =
    case model.tab of
        LayerTab ->
            div []
                [ div [ class "tab__header" ]
                    [ div
                        [ class "tab__choice"
                        , class "tab__choice--active"
                        , onClick (ChooseTab LayerTab)
                        ]
                        [ text "Layer" ]
                    , div
                        [ class "tab__choice"
                        , onClick (ChooseTab AdvancedTab)
                        ]
                        [ text "Advanced"
                        ]
                    ]
                , div [] [ viewLayerMenu model ]
                , div [ class "hidden" ] [ viewAdvancedMenu model ]
                ]

        AdvancedTab ->
            div []
                [ div [ class "tab__header" ]
                    [ div
                        [ class "tab__choice"
                        , onClick (ChooseTab LayerTab)
                        ]
                        [ text "Layer" ]
                    , div
                        [ class "tab__choice"
                        , class "tab__choice--active"
                        , onClick (ChooseTab AdvancedTab)
                        ]
                        [ text "Advanced"
                        ]
                    ]
                , div [ class "hidden" ] [ viewLayerMenu model ]
                , div [] [ viewAdvancedMenu model ]
                ]


viewAdvancedMenu : Model -> Html Msg
viewAdvancedMenu model =
    text "TODO: populate this menu system"


viewLayerMenu : Model -> Html Msg
viewLayerMenu model =
    case model.datasets of
        Success datasets ->
            div []
                [ viewDatasets datasets model
                , viewSelectedPoint model.point
                , viewHideShowIcon model.visible
                , viewCoastlineCheckbox model.coastlines
                ]

        Loading ->
            div [] [ text "..." ]

        Failure ->
            div [] [ text "failed to fetch datasets" ]


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
                , div [ style "margin" "0.5em" ] [ text (datumToString value) ]
                ]

        Temporal ->
            div []
                [ div [] [ text (key ++ ":") ]
                , div [ style "margin" "0.5em" ] [ text (formatTime (datumToInt value)) ]
                ]

        Horizontal ->
            text ""


datumToString : Datum -> String
datumToString datum =
    case datum of
        Discrete x ->
            String.fromInt x

        Continuous x ->
            String.fromFloat x


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
        , div [] [ viewSelected model ]
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
            Dict.get (idToInt dataset.id) model.datasetDescriptions
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
                                            { data_var = v
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

        Nothing ->
            optgroup [ attribute "label" dataset_label ] []


viewHideShowIcon : Bool -> Html Msg
viewHideShowIcon visible =
    div [ class "Sidebar__row" ]
        [ span [] [ text "Hide or show layer:" ]
        , button
            [ class "ShowLayer__button"
            , attribute "aria-label" "visible"
            , onClick HideShowLayer
            ]
            [ viewEye visible
            ]
        ]


viewEye : Bool -> Html Msg
viewEye visible =
    if visible then
        i [ class "fas fa-eye" ] []

    else
        i [ class "fas fa-eye-slash" ] []


viewCoastlineCheckbox : Bool -> Html Msg
viewCoastlineCheckbox flag =
    div []
        [ div [ class "label" ] [ text "Coastlines, borders and lakes" ]
        , div []
            [ fieldset []
                [ label []
                    [ input
                        [ attribute "type" "checkbox"
                        , checked flag
                        , onCheck HideShowCoastlines
                        ]
                        []
                    , text "Coastlines"
                    ]
                ]
            ]
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


type alias OnlyActive =
    { dataset : DatasetLabel, data_var : String }


type alias Items =
    { path : List String, items : List Datum }


type alias Item =
    { path : List String, item : Datum }


encodeAction : Action -> String
encodeAction action =
    case action of
        SetDatasets datasets ->
            Json.Encode.encode 0
                (Json.Encode.object
                    [ ( "type", Json.Encode.string "SET_DATASETS" )
                    , ( "payload", Json.Encode.list encodeDataset datasets )
                    ]
                )

        SetDatasetDescription payload ->
            Json.Encode.encode 0
                (Json.Encode.object
                    [ ( "type", Json.Encode.string "SET_DATASET_DESCRIPTION" )
                    , ( "payload", encodeDatasetDescription payload )
                    ]
                )

        SetOnlyActive active ->
            Json.Encode.encode 0
                (Json.Encode.object
                    [ ( "type", Json.Encode.string "SET_ONLY_ACTIVE" )
                    , ( "payload", encodeOnlyActive active )
                    ]
                )

        SetItems items ->
            Json.Encode.encode 0
                (Json.Encode.object
                    [ ( "type", Json.Encode.string "SET_ITEMS" )
                    , ( "payload", encodeItems items )
                    ]
                )

        GoToItem item ->
            Json.Encode.encode 0
                (Json.Encode.object
                    [ ( "type", Json.Encode.string "GOTO_ITEM" )
                    , ( "payload", encodeItem item )
                    ]
                )

        SetVisible flag ->
            Json.Encode.encode 0
                (Json.Encode.object
                    [ ( "type", Json.Encode.string "SET_VISIBLE" )
                    , ( "payload", Json.Encode.bool flag )
                    ]
                )

        SetFlag flag ->
            Json.Encode.encode 0
                (Json.Encode.object
                    [ ( "type", Json.Encode.string "SET_FLAG" )
                    , ( "payload"
                      , Json.Encode.object
                            [ ( "coastlines", Json.Encode.bool flag )
                            ]
                      )
                    ]
                )


encodeDataset : Dataset -> Json.Encode.Value
encodeDataset dataset =
    Json.Encode.object
        [ ( "id", Json.Encode.int (idToInt dataset.id) )
        , ( "driver", Json.Encode.string dataset.driver )
        , ( "label", Json.Encode.string (labelToString dataset.label) )
        , ( "view", Json.Encode.string dataset.view )
        ]


encodeDatasetDescription : DatasetDescription -> Json.Encode.Value
encodeDatasetDescription description =
    Json.Encode.object
        [ ( "datasetId", Json.Encode.int (idToInt description.dataset_id) )
        , ( "data", encodeData description )
        ]


encodeData : DatasetDescription -> Json.Encode.Value
encodeData desc =
    Json.Encode.object
        [ ( "attrs", encodeAttrs desc.attrs )
        , ( "dataset_id", Json.Encode.int (idToInt desc.dataset_id) )
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
        , ( "items", Json.Encode.list encodeDatum items.items )
        ]


encodeItem : Item -> Json.Encode.Value
encodeItem item =
    Json.Encode.object
        [ ( "path", Json.Encode.list Json.Encode.string item.path )
        , ( "item", encodeDatum item.item )
        ]



-- JSON ENCODERS


queryToString : Query -> String
queryToString query =
    Json.Encode.encode 0
        (Json.Encode.object
            [ ( "start_time", encodeDatum query.start_time )
            ]
        )


dataVarToString : SelectDataVar -> String
dataVarToString props =
    Json.Encode.encode 0
        (Json.Encode.object
            [ ( "dataset_id", Json.Encode.int (idToInt props.dataset_id) )
            , ( "data_var", Json.Encode.string props.data_var )
            ]
        )


pointToString : SelectPoint -> String
pointToString props =
    Json.Encode.encode 0
        (Json.Encode.object
            [ ( "dim_name", Json.Encode.string props.dim_name )
            , ( "point", encodeDatum props.point )
            ]
        )


encodeDatum : Datum -> Json.Encode.Value
encodeDatum datum =
    case datum of
        Discrete x ->
            Json.Encode.int x

        Continuous x ->
            Json.Encode.float x


viewSelected : Model -> Html Msg
viewSelected model =
    case model.selected of
        Just payload ->
            let
                dataset_id =
                    idToInt payload.dataset_id

                maybeDesc =
                    Dict.get dataset_id model.datasetDescriptions
            in
            case maybeDesc of
                Just request ->
                    case request of
                        Success desc ->
                            let
                                maybeVar =
                                    Dict.get payload.data_var desc.data_vars
                            in
                            case maybeVar of
                                Just var ->
                                    viewDims (List.map (selectDimension model) var.dims)

                                Nothing ->
                                    text "No dims found"

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
            idToInt dataset_id

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
            option [ attribute "value" value ] [ text (datumToString point) ]

        Temporal ->
            option [ attribute "value" value ] [ text (formatTime (datumToInt point)) ]

        Horizontal ->
            option [ attribute "value" value ] [ text (datumToString point) ]


datumToInt : Datum -> Int
datumToInt datum =
    case datum of
        Discrete x ->
            x

        Continuous x ->
            round x


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
    hash HashReceived
