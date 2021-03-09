module NaturalEarthFeature exposing (NaturalEarthFeature(..), encode, endpoint)

import Endpoint
import Json.Encode
import MapExtent exposing (Box)
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


endpoint : NaturalEarthFeature -> Box -> String
endpoint feature box =
    let
        path =
            Endpoint.format
                [ "natural_earth_feature"
                , category feature
                , name feature
                ]

        scale =
            Scale.fromExtent
                box.minlon
                box.maxlon
                box.minlat
                box.maxlat
    in
    path
        ++ "?"
        ++ Endpoint.paramsToString
            [ ( "minlon", String.fromFloat box.minlon )
            , ( "maxlon", String.fromFloat box.maxlon )
            , ( "minlat", String.fromFloat box.minlat )
            , ( "maxlat", String.fromFloat box.maxlat )
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
