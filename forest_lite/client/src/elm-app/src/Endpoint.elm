module Endpoint exposing (..)

import DatasetID exposing (DatasetID)
import Datum exposing (Datum)
import Json.Encode


type alias Query =
    { start_time : Datum }


type Endpoint
    = Datasets
    | DatasetDescription DatasetID
    | Axis DatasetID String String (Maybe Datum)
    | Coastlines


toString : Endpoint -> String
toString endpoint =
    case endpoint of
        Coastlines ->
            format [ "atlas", "coastlines" ]

        Datasets ->
            format [ "datasets" ]

        DatasetDescription id ->
            format [ "datasets", DatasetID.toString id ]

        Axis dataset_id data_var dim maybeStartTime ->
            let
                path =
                    format
                        [ "datasets"
                        , DatasetID.toString dataset_id
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


format : List String -> String
format paths =
    "/" ++ String.join "/" paths


queryToString : Query -> String
queryToString query =
    Json.Encode.encode 0
        (Json.Encode.object
            [ ( "start_time", Datum.encode query.start_time )
            ]
        )
