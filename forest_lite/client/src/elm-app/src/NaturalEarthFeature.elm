module NaturalEarthFeature exposing (NaturalEarthFeature(..), encode, endpoint)

import Endpoint
import Json.Encode
import MapExtent exposing (MapExtent)
import Scale


type NaturalEarthFeature
    = Coastline
    | Lake
    | Border
    | DisputedBorder


encode : NaturalEarthFeature -> Json.Encode.Value
encode feature =
    Json.Encode.string (toString feature)


toString : NaturalEarthFeature -> String
toString feature =
    case feature of
        Coastline ->
            "coastlines"

        Border ->
            "borders"

        DisputedBorder ->
            "disputed"

        Lake ->
            "lakes"


endpoint : NaturalEarthFeature -> MapExtent -> String
endpoint feature map_extent =
    let
        path =
            Endpoint.format
                [ "natural_earth_feature"
                , category feature
                , name feature
                ]
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


category : NaturalEarthFeature -> String
category feature =
    case feature of
        Coastline ->
            "physical"

        Lake ->
            "physical"

        Border ->
            "cultural"

        DisputedBorder ->
            "cultural"


name : NaturalEarthFeature -> String
name feature =
    case feature of
        Coastline ->
            "coastline"

        Lake ->
            "lakes"

        Border ->
            "admin_0_boundary_lines_land"

        DisputedBorder ->
            "admin_0_boundary_lines_disputed_areas"
