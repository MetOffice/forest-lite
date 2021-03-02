module NaturalEarthFeature exposing (NaturalEarthFeature(..), endpoint)

import Endpoint
import MapExtent exposing (MapExtent)
import Scale


type NaturalEarthFeature
    = Coastline
    | Border
    | Lake


coastlines : MapExtent -> String
coastlines map_extent =
    endpoint Coastline map_extent


borders : MapExtent -> String
borders map_extent =
    endpoint Border map_extent


lakes : MapExtent -> String
lakes map_extent =
    endpoint Lake map_extent


toString : NaturalEarthFeature -> String
toString feature =
    case feature of
        Coastline ->
            "coastlines"

        Border ->
            "borders"

        Lake ->
            "lakes"


endpoint : NaturalEarthFeature -> MapExtent -> String
endpoint feature map_extent =
    let
        path =
            Endpoint.format [ "atlas", toString feature ]
    in
    case map_extent of
        MapExtent.MapExtent x_start x_end y_start y_end ->
            let
                scale =
                    Scale.fromExtent x_start x_end y_start y_end
            in
            path
                ++ "?"
                ++ Endpoint.paramsToString
                    [ ( "minlon", String.fromFloat x_start )
                    , ( "maxlon", String.fromFloat x_end )
                    , ( "minlat", String.fromFloat y_start )
                    , ( "maxlat", String.fromFloat y_end )
                    , ( "scale", Scale.toString scale )
                    ]

        MapExtent.NotReady ->
            path
