module NaturalEarthFeature exposing (NaturalEarthFeature(..), encode, endpoint)

import Endpoint
import Json.Encode
import MapExtent exposing (Viewport, WebMercator)
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


endpoint : NaturalEarthFeature -> Maybe (Viewport WebMercator) -> String
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
        Just (MapExtent.Viewport start end) ->
            let
                scale =
                    Scale.fromExtent start.x end.x start.y end.y
            in
            path
                ++ "?"
                ++ Endpoint.paramsToString
                    [ ( "minlon", String.fromFloat start.x )
                    , ( "maxlon", String.fromFloat end.x )
                    , ( "minlat", String.fromFloat start.y )
                    , ( "maxlat", String.fromFloat end.y )
                    , ( "scale", Scale.toString scale )
                    ]

        Nothing ->
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
