module Endpoint exposing (..)

import DatasetID exposing (DatasetID)
import Datum exposing (Datum)
import Json.Encode
import MapExtent exposing (MapExtent)
import Scale


type alias Query =
    { start_time : Datum }


type Endpoint
    = Datasets
    | DatasetDescription DatasetID
    | Axis DatasetID String String (Maybe Datum)
    | Coastlines MapExtent


toString : Endpoint -> String
toString endpoint =
    case endpoint of
        Coastlines map_extent ->
            coastlines map_extent

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


type NaturalEarthFeature
    = Coastline
    | Border
    | Lake


featureToString : NaturalEarthFeature -> String
featureToString feature =
    case feature of
        Coastline ->
            "coastlines"

        Border ->
            "borders"

        Lake ->
            "lakes"


coastlines : MapExtent -> String
coastlines map_extent =
    natural_earth_feature Coastline map_extent


natural_earth_feature : NaturalEarthFeature -> MapExtent -> String
natural_earth_feature feature map_extent =
    let
        path =
            format [ "atlas", featureToString feature ]
    in
    case map_extent of
        MapExtent.MapExtent x_start x_end y_start y_end ->
            let
                scale =
                    Scale.fromExtent x_start x_end y_start y_end
            in
            path
                ++ "?"
                ++ paramsToString
                    [ ( "minlon", String.fromFloat x_start )
                    , ( "maxlon", String.fromFloat x_end )
                    , ( "minlat", String.fromFloat y_start )
                    , ( "maxlat", String.fromFloat y_end )
                    , ( "scale", Scale.toString scale )
                    ]

        MapExtent.NotReady ->
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
