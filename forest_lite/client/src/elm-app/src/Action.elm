module Action exposing (Action(..), decoder, encode, toString)

import BoundingBox exposing (BoundingBox)
import DataVar.Label exposing (Label)
import Dataset exposing (Dataset)
import Dataset.Description exposing (Description)
import Dataset.ID exposing (ID)
import Dataset.Label exposing (Label)
import Datum exposing (Datum)
import Json.Decode exposing (Decoder)
import Json.Encode exposing (list, string)
import MultiLine exposing (MultiLine)
import NaturalEarthFeature exposing (NaturalEarthFeature)
import NaturalEarthFeature.Action exposing (Action(..))
import Opacity exposing (Opacity)
import Quadkey exposing (Quadkey)



-- JSON encoders to simulate action creators, only needed while migrating


type Action
    = SetDatasets (List Dataset)
    | SetDatasetDescription Dataset.Description.Description
    | SetOnlyActive OnlyActive
    | SetItems Items
    | GoToItem Item
    | SetVisible Bool
    | SetOpacityAction Opacity
    | SetFlag Bool
    | SetLimits Float Float Dataset.ID.ID DataVar.Label.Label
    | SetQuadkeys (List Quadkey)
    | SetFigure Float Float Float Float
    | GetHttpNaturalEarthFeature NaturalEarthFeature Quadkey
    | SetHttpNaturalEarthFeature NaturalEarthFeature BoundingBox Quadkey MultiLine
    | NaturalEarthFeatureAction NaturalEarthFeature.Action.Action
    | SetColors (List String)


type alias OnlyActive =
    { dataset : Dataset.Label.Label, data_var : String }


type alias Items =
    { path : List String, items : List Datum }


type alias Item =
    { path : List String, item : Datum }



-- DECODE


decoder : Decoder Action
decoder =
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

        "GET_HTTP_NATURAL_EARTH_FEATURE" ->
            Json.Decode.field "payload"
                (Json.Decode.map2 GetHttpNaturalEarthFeature
                    (Json.Decode.field "feature" NaturalEarthFeature.decoder)
                    (Json.Decode.field "quadkey" Quadkey.decoder)
                )

        _ ->
            Json.Decode.field "payload"
                (Json.Decode.map4 SetLimits
                    (Json.Decode.field "low" Json.Decode.float)
                    (Json.Decode.field "high" Json.Decode.float)
                    (Json.Decode.field "path" (Json.Decode.index 0 Dataset.ID.decoder))
                    (Json.Decode.field "path" (Json.Decode.index 1 DataVar.Label.decoder))
                )



-- ENCODE


toString : String -> Json.Encode.Value -> String
toString key payload =
    Json.Encode.encode 0
        (Json.Encode.object
            [ ( "type", Json.Encode.string key )
            , ( "payload", payload )
            ]
        )


encode : Action -> String
encode action =
    case action of
        SetFigure x_start x_end y_start y_end ->
            toString "SET_FIGURE"
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

        SetHttpNaturalEarthFeature feature box quadkey data ->
            toString "SET_HTTP_NATURAL_EARTH_FEATURE"
                (Json.Encode.object
                    [ ( "feature", NaturalEarthFeature.encode feature )
                    , ( "data", MultiLine.encode data )
                    , ( "bounding_box", BoundingBox.encode box )
                    , ( "quadkey", Quadkey.encode quadkey )
                    ]
                )

        GetHttpNaturalEarthFeature feature quadkey ->
            toString "GET_HTTP_NATURAL_EARTH_FEATURE"
                (Json.Encode.object
                    [ ( "feature", NaturalEarthFeature.encode feature )
                    , ( "quadkey", Quadkey.encode quadkey )
                    ]
                )

        SetQuadkeys quadkeys ->
            toString "SET_QUADKEYS"
                (Json.Encode.list Quadkey.encode quadkeys)

        SetDatasets datasets ->
            toString "SET_DATASETS"
                (Json.Encode.list encodeDataset datasets)

        SetDatasetDescription payload ->
            toString "SET_DATASET_DESCRIPTION"
                (Dataset.Description.encode payload)

        SetOnlyActive active ->
            toString "SET_ONLY_ACTIVE"
                (encodeOnlyActive active)

        SetItems items ->
            toString "SET_ITEMS"
                (encodeItems items)

        GoToItem item ->
            toString "GOTO_ITEM"
                (encodeItem item)

        SetVisible flag ->
            toString "SET_VISIBLE"
                (Json.Encode.bool flag)

        SetOpacityAction opacity ->
            toString "SET_OPACITY"
                (Opacity.encode opacity)

        SetFlag flag ->
            toString "SET_FLAG"
                (Json.Encode.object
                    [ ( "coastlines", Json.Encode.bool flag )
                    ]
                )

        SetLimits lower upper dataset_id datavar ->
            toString "SET_LIMITS"
                (Json.Encode.object
                    [ ( "high", Json.Encode.float upper )
                    , ( "low", Json.Encode.float lower )
                    , ( "path", encodeLimitPath dataset_id datavar )
                    ]
                )

        NaturalEarthFeatureAction subAction ->
            let
                payload =
                    NaturalEarthFeature.Action.payload subAction

                key =
                    NaturalEarthFeature.Action.key subAction
            in
            toString key payload

        SetColors colors ->
            toString "SET_COLORS" (list string colors)


encodeLimitPath : Dataset.ID.ID -> DataVar.Label.Label -> Json.Encode.Value
encodeLimitPath dataset_id data_var =
    Json.Encode.list identity
        [ Dataset.ID.encode dataset_id
        , DataVar.Label.encode data_var
        ]


encodeDataset : Dataset -> Json.Encode.Value
encodeDataset dataset =
    Json.Encode.object
        [ ( "id", Dataset.ID.encode dataset.id )
        , ( "driver", Json.Encode.string dataset.driver )
        , ( "label", Dataset.Label.encode dataset.label )
        , ( "view", Json.Encode.string dataset.view )
        ]


encodeOnlyActive : OnlyActive -> Json.Encode.Value
encodeOnlyActive only_active =
    Json.Encode.object
        [ ( "dataset", Dataset.Label.encode only_active.dataset )
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
