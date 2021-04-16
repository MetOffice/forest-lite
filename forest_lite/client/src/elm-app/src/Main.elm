module Main exposing (..)

import Action exposing (Action(..))
import Api.Enum.Kind exposing (Kind(..))
import Attrs
import BoundingBox exposing (BoundingBox)
import Browser
import ColorSchemeRequest exposing (ColorScheme)
import Colorbar
import Colorbar.Limits exposing (DataLimits(..), LimitOrigin(..), Limits)
import Colorbar.Menu exposing (Config)
import DataVar.Label exposing (Label)
import DataVar.Select exposing (Select)
import Dataset exposing (Dataset)
import Dataset.Description exposing (Description)
import Dataset.ID exposing (ID)
import Dataset.Label exposing (Label)
import Datum exposing (Datum)
import Dict exposing (Dict)
import Dimension exposing (Dimension, SelectPoint)
import Dimension.Kind exposing (Kind(..))
import Dimension.Label exposing (Label)
import Endpoint
import Geometry
import Graphql.Http
import Helpers exposing (onSelect)
import Html
    exposing
        ( Html
        , button
        , div
        , fieldset
        , h1
        , h3
        , i
        , input
        , label
        , li
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
        , selected
        , style
        , value
        )
import Html.Events
    exposing
        ( onCheck
        , onClick
        , onInput
        )
import Http
import JWT
import Json.Decode
    exposing
        ( Decoder
        , field
        , float
        , list
        , maybe
        , string
        )
import Json.Encode
import MapExtent
import MultiLine exposing (MultiLine)
import NaturalEarthFeature exposing (NaturalEarthFeature)
import NaturalEarthFeature.Action exposing (Action(..))
import Opacity exposing (Opacity)
import Palettes exposing (Palettes)
import Point exposing (Point)
import Ports exposing (receiveData, sendAction)
import Quadkey exposing (Quadkey)
import Request exposing (Request(..))
import Scale exposing (Scale)
import Viewport exposing (Viewport)
import WebMercator
import ZXY exposing (XY)
import ZoomLevel exposing (ZoomLevel)


type alias Settings =
    { claim : Maybe JWT.Claim
    , baseURL : String
    }


flagsDecoder : Decoder Settings
flagsDecoder =
    Json.Decode.map2 Settings
        (maybe (field "claim" JWT.decoder))
        (field "baseURL" string)


type alias User =
    { name : String
    , email : String
    , groups : List String
    }


type PortMessage
    = PortHash String
    | PortAction Action.Action


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
                (Json.Decode.field "payload" Action.decoder)



-- GRAPHQL API


graphqlRequest : String -> Cmd Msg
graphqlRequest baseURL =
    ColorSchemeRequest.queryByName "Spectral"
        |> Graphql.Http.queryRequest (baseURL ++ "/graphql")
        |> Graphql.Http.send GotResponse



-- MODEL


type alias Model =
    { user : Maybe User
    , route : Maybe Route
    , selected : Maybe DataVar.Select.Select
    , datasets : Request (List Dataset)
    , datasetDescriptions : Dict Int (Request Dataset.Description.Description)
    , dimensions : Dict String Dimension
    , point : Maybe Point
    , baseURL : String
    , visible : Bool
    , coastlines : Bool
    , coastlines_color : String
    , coastlines_width : Int
    , limits : Colorbar.Limits.Limits
    , palette : Palettes.Name
    , palette_level : Int
    , palettes : List String
    , opacity : Opacity
    , collapsed : Dict String Bool
    , colorSchemes : List ColorScheme
    }


type alias Axis =
    { attrs : Dict String String
    , data : List Datum
    , data_var : DataVar.Label.Label
    , dim_name : Dimension.Label.Label
    }


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
    | GotNaturalEarthFeature NaturalEarthFeature BoundingBox Quadkey (Result Http.Error MultiLine)
    | GotDatasets (Result Http.Error (List Dataset))
    | GotDatasetDescription Dataset.ID.ID (Result Http.Error Dataset.Description.Description)
    | GotAxis Dataset.ID.ID (Result Http.Error Axis)
    | GotResponse (Result (Graphql.Http.Error (List ColorScheme)) (List ColorScheme))
    | DataVarSelected String
    | PointSelected String
    | HideShowLayer Bool
    | HideShowCoastlines Bool
    | ExpandCollapse SubMenu
    | NaturalEarthFeature NaturalEarthFeature.Msg
    | ColorbarMenuMsg Colorbar.Menu.Msg
    | SetOpacityMsg Opacity


type SubMenu
    = DatasetMenu
    | DimensionMenu
    | DisplayMenu
    | ColorbarMenu



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
            , coastlines_width = 1
            , limits = Colorbar.Limits.init
            , palette = Palettes.fromString "Reds"
            , palette_level = 3
            , palettes = Palettes.names
            , opacity = Opacity.opaque
            , collapsed =
                Dict.empty
            , colorSchemes = []
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
                        , graphqlRequest baseURL
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
        (field "attrs" Attrs.decoder)
        (field "data" (list Datum.decoder))
        (field "data_var" DataVar.Label.decoder)
        (field "dim_name" Dimension.Label.decoder)


selectPointDecoder : Decoder SelectPoint
selectPointDecoder =
    Json.Decode.map2
        SelectPoint
        (field "dim_name" Dimension.Label.decoder)
        (field "point" Datum.decoder)



-- UPDATE


insertDimension : Axis -> Model -> Model
insertDimension axis model =
    let
        key =
            Dimension.Label.toString axis.dim_name

        dimension =
            { label = axis.dim_name
            , points = axis.data
            , kind = Dimension.Kind.parse axis.dim_name
            }

        dimensions =
            Dict.insert key dimension model.dimensions
    in
    { model | dimensions = dimensions }


initPoint : Axis -> Model -> Model
initPoint axis model =
    let
        key =
            Dimension.Label.toString axis.dim_name

        dim_name =
            axis.dim_name

        maybeValue =
            List.head axis.data
    in
    case maybeValue of
        Just value ->
            case model.point of
                Just point ->
                    if Dict.member key point then
                        model

                    else
                        let
                            newPoint =
                                Dict.insert key value point
                        in
                        { model | point = Just newPoint }

                Nothing ->
                    let
                        container =
                            Dict.empty

                        newPoint =
                            Dict.insert key value container
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
        GotNaturalEarthFeature feature box quadkey result ->
            case result of
                Ok multi_line ->
                    let
                        z =
                            Quadkey.toZoomLevel quadkey

                        xy =
                            Quadkey.toXY quadkey

                        viewport =
                            MapExtent.xyToExtent z xy

                        bounding_box =
                            WebMercator.toBoundingBox2d viewport

                        data =
                            Geometry.clip bounding_box multi_line

                        cmd =
                            SetHttpNaturalEarthFeature feature box quadkey data
                                |> Action.encode
                                |> sendAction
                    in
                    ( model, cmd )

                Err _ ->
                    ( model, Cmd.none )

        NaturalEarthFeature subMsg ->
            let
                ( newModel, subAction ) =
                    NaturalEarthFeature.update subMsg model

                cmd =
                    NaturalEarthFeatureAction subAction
                        |> Action.encode
                        |> sendAction
            in
            ( newModel, cmd )

        -- DIMENSIONS
        GotAxis dataset_id result ->
            case result of
                Ok axis ->
                    let
                        maybeDatasetLabel =
                            selectDatasetLabelById model.datasets dataset_id
                    in
                    case maybeDatasetLabel of
                        Just dataset_label ->
                            case Dimension.Kind.parse axis.dim_name of
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
                                                , Dataset.Label.toString dataset_label
                                                , DataVar.Label.toString axis.data_var
                                                , Dimension.Label.toString axis.dim_name
                                                ]
                                            , items = axis.data
                                            }
                                            |> Action.encode
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
                                |> Action.encode
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
                            Dataset.ID.toInt dataset_id

                        datasetDescriptions =
                            Dict.insert key (Success desc) model.datasetDescriptions
                    in
                    ( { model | datasetDescriptions = datasetDescriptions }
                    , SetDatasetDescription desc
                        |> Action.encode
                        |> sendAction
                    )

                Err _ ->
                    ( model, Cmd.none )

        DataVarSelected payload ->
            case Json.Decode.decodeString DataVar.Select.decoder payload of
                Ok selected ->
                    let
                        dataset_id =
                            selected.dataset_id

                        data_var =
                            DataVar.Label.toString selected.data_var

                        maybeDatasetLabel =
                            selectDatasetLabelById model.datasets dataset_id

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
                                        |> Action.encode
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
                                                (DataVar.Label.Label data_var)
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
                                    , Dataset.Label.toString dataset_label
                                    , DataVar.Label.toString data_var
                                    , Dimension.Label.toString selectPoint.dim_name
                                    ]

                                actionCmd =
                                    GoToItem { path = path, item = selectPoint.point }
                                        |> Action.encode
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
                |> Action.encode
                |> sendAction
            )

        HideShowCoastlines check ->
            ( { model | coastlines = check }
            , SetFlag check
                |> Action.encode
                |> sendAction
            )

        ExpandCollapse menu ->
            let
                flag =
                    getCollapsed menu model.collapsed

                collapsed =
                    setCollapsed menu (not flag) model.collapsed
            in
            ( { model | collapsed = collapsed }, Cmd.none )

        SetOpacityMsg value ->
            let
                cmd =
                    SetOpacityAction value
                        |> Action.encode
                        |> sendAction
            in
            ( { model | opacity = value }, cmd )

        ColorbarMenuMsg subMsg ->
            let
                ( newModel, newCmd ) =
                    Colorbar.Menu.update subMsg model
            in
            ( newModel, Cmd.map ColorbarMenuMsg newCmd )

        GotResponse result ->
            case result of
                Ok colorSchemes ->
                    ( { model | colorSchemes = colorSchemes }, Cmd.none )

                _ ->
                    ( model, Cmd.none )



-- Interpret Redux actions


updateAction : Model -> Action.Action -> ( Model, Cmd Msg )
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

                viewport =
                    Viewport.Viewport start end

                zoom_level =
                    MapExtent.viewportToZoomLevel viewport
                        |> Scale.truncateZoomLevel

                xys =
                    MapExtent.tiles zoom_level viewport

                quadkeys =
                    List.map (\xy -> Quadkey.fromXY zoom_level xy) xys

                cmd =
                    SetQuadkeys quadkeys
                        |> Action.encode
                        |> sendAction
            in
            ( model, cmd )

        GetHttpNaturalEarthFeature feature quadkey ->
            let
                z =
                    Quadkey.toZoomLevel quadkey

                xy =
                    Quadkey.toXY quadkey

                bounding_box =
                    MapExtent.toBox z xy

                scale =
                    Scale.fromZoomLevel z

                cmd =
                    getNaturalEarthFeature model.baseURL feature bounding_box scale quadkey
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
                |> Action.encode
                |> sendAction
            )


setLimitsCmds : LimitOrigin -> Action.Action -> Cmd Msg
setLimitsCmds origin action =
    case origin of
        UserInput ->
            Cmd.none

        DataSource ->
            action
                |> Action.encode
                |> sendAction



-- Logic to request time axis if start_time axis changes


linkAxis : Model -> SelectPoint -> List (Cmd Msg)
linkAxis model selectPoint =
    let
        dataset_id =
            selectDatasetId model.selected

        data_var =
            selectDataVarLabel model

        dim =
            Dimension.Label.Label "time"

        start_time =
            selectPoint.point

        str =
            Dimension.Label.toString selectPoint.dim_name
    in
    if str == "start_time" then
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
            Dimension.Label.toString selectPoint.dim_name

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


getNaturalEarthFeature : String -> NaturalEarthFeature -> BoundingBox -> Scale -> Quadkey -> Cmd Msg
getNaturalEarthFeature baseURL feature box scale quadkey =
    let
        endpoint =
            NaturalEarthFeature.endpoint feature box scale

        -- Tagger should take key, e.g. Quadkey
        tagger =
            GotNaturalEarthFeature feature box quadkey
    in
    Http.get
        { url = baseURL ++ endpoint
        , expect = Http.expectJson tagger MultiLine.decoder
        }


getDatasets : String -> Cmd Msg
getDatasets baseURL =
    let
        endpoint =
            Endpoint.Datasets

        decoder =
            field "datasets" (list Dataset.decoder)
    in
    Http.get
        { url = baseURL ++ Endpoint.toString endpoint
        , expect = Http.expectJson GotDatasets decoder
        }


getDatasetDescription : String -> Dataset.ID.ID -> Cmd Msg
getDatasetDescription baseURL id =
    let
        endpoint =
            Endpoint.DatasetDescription id
    in
    Http.get
        { url = baseURL ++ Endpoint.toString endpoint
        , expect = Http.expectJson (GotDatasetDescription id) Dataset.Description.decoder
        }


getAxis :
    String
    -> Dataset.ID.ID
    -> DataVar.Label.Label
    -> Dimension.Label.Label
    -> Maybe Datum
    -> Cmd Msg
getAxis baseURL dataset_id data_var_label dim maybeStartTime =
    let
        data_var =
            DataVar.Label.toString data_var_label

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


viewColorScheme : ColorScheme -> Html Msg
viewColorScheme colorScheme =
    let
        kind =
            colorScheme.kind
                |> Maybe.map Api.Enum.Kind.toString
                |> Maybe.withDefault "???"
    in
    div [] [ text (colorScheme.name ++ "  --  " ++ kind) ]


viewLayerMenu : Model -> Html Msg
viewLayerMenu model =
    case model.datasets of
        Success datasets ->
            div []
                [ div [] (List.map viewColorScheme model.colorSchemes)

                -- Select collection
                , viewCollapse
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
                            , viewOpacity
                                (SetOpacityMsg
                                    << Maybe.withDefault Opacity.opaque
                                    << Opacity.fromString
                                )
                                model.opacity
                            , viewCoastlineCheckbox model.coastlines
                            , div
                                [ style "border" "1px solid #ccc"
                                , style "border-radius" "4px"
                                , style "margin" "0.5em"
                                , style "padding" "0.5em"
                                ]
                                [ viewColorPicker
                                    (NaturalEarthFeature
                                        << NaturalEarthFeature.SelectColor
                                    )
                                    model.coastlines_color
                                , viewInputNumber
                                    (NaturalEarthFeature
                                        << NaturalEarthFeature.SelectWidth
                                        << Maybe.withDefault 1
                                        << String.toInt
                                    )
                                    model.coastlines_width
                                ]
                            ]
                    , onClick = ExpandCollapse DisplayMenu
                    }

                -- Configure colorbar
                , viewCollapse
                    { active = getCollapsed ColorbarMenu model.collapsed
                    , head = text "Colorbar settings"
                    , body = Html.map ColorbarMenuMsg (Colorbar.Menu.view model)
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


viewDatasets : List Dataset -> Model -> Html Msg
viewDatasets datasets model =
    div []
        [ div [ class "select__container" ]
            [ viewDatasetLabel model
            , select
                [ onSelect DataVarSelected
                , class "select__select"
                ]
                (List.map (Dataset.view model.datasetDescriptions) datasets)
            ]
        ]


viewDatasetLabel : Model -> Html Msg
viewDatasetLabel model =
    case selectDatasetLabel model of
        Just dataset_label ->
            label [ class "select__label" ]
                [ text ("Dataset: " ++ Dataset.Label.toString dataset_label)
                ]

        Nothing ->
            label [ class "select__label" ] [ text "Dataset:" ]


viewOpacity : (String -> Msg) -> Opacity -> Html Msg
viewOpacity toMsg opacity =
    let
        minValue =
            "0"

        maxValue =
            "1"

        stepValue =
            "0.01"
    in
    div
        [ style "margin" "0.5em"
        , style "border" "1px solid #ccc"
        , style "border-radius" "4px"
        , style "padding" "0.5em"
        ]
        [ div
            []
            [ input
                [ attribute "type" "number"
                , attribute "min" minValue
                , attribute "max" maxValue
                , attribute "step" stepValue
                , style "width" "4em"
                , value (Opacity.toString opacity)
                , onSelect toMsg
                ]
                []
            , span
                [ style "margin-left" "1em"
                ]
                [ text "Opacity"
                ]
            ]
        , input
            [ attribute "type" "range"
            , attribute "min" minValue
            , attribute "max" maxValue
            , attribute "step" stepValue
            , style "width" "100%"
            , value (Opacity.toString opacity)
            , onSelect toMsg
            ]
            []
        ]


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


{-| Color picker

HTML input tag with type set to color

-}
viewColorPicker : (String -> Msg) -> String -> Html Msg
viewColorPicker toMsg str =
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
                , onSelect toMsg
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


{-| Number widget

HTML input tag with type set to number

-}
viewInputNumber : (String -> Msg) -> Int -> Html Msg
viewInputNumber toMsg n =
    let
        inputId =
            "coastline-width"
    in
    div
        [ style "margin-top" "0.3em"
        ]
        [ div
            [ style "display" "inline-block"
            , style "margin" "0 0.5em"
            ]
            [ input
                [ attribute "type" "number"
                , value (String.fromInt n)
                , attribute "min" "1"
                , onSelect toMsg
                , id inputId
                , style "width" "2em"
                , style "border" "1px solid #ccc"
                , style "border-radius" "4px"
                , style "padding" "6px 4px"
                ]
                []
            ]
        , label
            [ for inputId
            , style "cursor" "pointer"
            ]
            [ text "Choose coastline width" ]
        ]


viewSelected : Model -> Html Msg
viewSelected model =
    case model.selected of
        Just payload ->
            let
                dataset_id =
                    Dataset.ID.toInt payload.dataset_id

                maybeDesc =
                    Dict.get dataset_id model.datasetDescriptions
            in
            case maybeDesc of
                Just request ->
                    case request of
                        Success desc ->
                            let
                                key =
                                    DataVar.Label.toString payload.data_var

                                maybeVar =
                                    Dict.get key desc.data_vars
                            in
                            case maybeVar of
                                Just var ->
                                    var.dims
                                        |> List.map
                                            (Dimension.get model.dimensions)
                                        |> List.filterMap identity
                                        |> viewDims PointSelected model.point

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


selectDatasetId : Maybe DataVar.Select.Select -> Maybe Dataset.ID.ID
selectDatasetId =
    Maybe.map .dataset_id


selectDatasetLabel : Model -> Maybe Dataset.Label.Label
selectDatasetLabel model =
    case selectDatasetId model.selected of
        Just dataset_id ->
            selectDatasetLabelById model.datasets dataset_id

        Nothing ->
            Nothing


selectDatasetLabelById : Request (List Dataset) -> Dataset.ID.ID -> Maybe Dataset.Label.Label
selectDatasetLabelById requestDatasets dataset_id =
    case requestDatasets of
        Success datasets ->
            datasets
                |> List.filter (matchId dataset_id)
                |> List.head
                |> Maybe.map .label

        _ ->
            Nothing


matchId : Dataset.ID.ID -> Dataset -> Bool
matchId dataset_id dataset =
    dataset.id == dataset_id


selectDataVarLabel : Model -> Maybe DataVar.Label.Label
selectDataVarLabel model =
    case model.selected of
        Just selected ->
            Just selected.data_var

        Nothing ->
            Nothing


selectedDims :
    Model
    -> Dataset.ID.ID
    -> String
    -> Maybe (List Dimension.Label.Label)
selectedDims model dataset_id data_var =
    let
        key =
            Dataset.ID.toInt dataset_id

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


viewDims : (String -> Msg) -> Maybe Point -> List Dimension -> Html Msg
viewDims toMsg maybePoint dims =
    div [] (List.map (Dimension.view toMsg maybePoint) dims)



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
