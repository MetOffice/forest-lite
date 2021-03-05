module NaturalEarthFeature exposing (NaturalEarthFeature(..), encode, endpoint)

import Endpoint
import Json.Encode
import MapExtent exposing (Viewport, WGS84, WebMercator)
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


endpoint : NaturalEarthFeature -> Viewport WGS84 -> String
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
        MapExtent.Viewport start end ->
            let
                scale =
                    Scale.fromExtent
                        start.longitude
                        end.longitude
                        start.latitude
                        end.latitude
            in
            path
                ++ "?"
                ++ Endpoint.paramsToString
                    [ ( "minlon", String.fromFloat start.longitude )
                    , ( "maxlon", String.fromFloat end.longitude )
                    , ( "minlat", String.fromFloat start.latitude )
                    , ( "maxlat", String.fromFloat end.latitude )
                    , ( "scale", Scale.toString scale )
                    ]


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
