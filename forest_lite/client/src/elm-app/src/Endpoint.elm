module Endpoint exposing (..)

import Dataset.ID exposing (ID)
import Datum exposing (Datum)
import Dimension.Label exposing (Label)
import Json.Encode


type alias Query =
    { start_time : Datum }


type Endpoint
    = Datasets
    | DatasetDescription Dataset.ID.ID
    | Axis Dataset.ID.ID String Dimension.Label.Label (Maybe Datum)


toString : Endpoint -> String
toString endpoint =
    case endpoint of
        Datasets ->
            format [ "datasets" ]

        DatasetDescription id ->
            format [ "datasets", Dataset.ID.toString id ]

        Axis dataset_id data_var dim maybeStartTime ->
            let
                path =
                    format
                        [ "datasets"
                        , Dataset.ID.toString dataset_id
                        , data_var
                        , "axis"
                        , Dimension.Label.toString dim
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


paramsToString : List ( String, String ) -> String
paramsToString params =
    String.join "&" (List.map eqnToString params)


eqnToString : ( String, String ) -> String
eqnToString ( key, value ) =
    String.join "=" [ key, value ]


queryToString : Query -> String
queryToString query =
    Json.Encode.encode 0
        (Json.Encode.object
            [ ( "start_time", Datum.encode query.start_time )
            ]
        )
