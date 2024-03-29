module NaturalEarthFeature exposing
    ( Msg(..)
    , NaturalEarthFeature(..)
    , decoder
    , encode
    , endpoint
    , update
    )

import BoundingBox exposing (BoundingBox)
import Endpoint
import Json.Decode exposing (Decoder)
import Json.Encode
import NaturalEarthFeature.Action as Action exposing (Action(..))
import Scale exposing (Scale)



-- MODEL


type alias Model r =
    { r
        | coastlines_color : String
        , coastlines_width : Int
    }



-- UPDATE


type Msg
    = SelectColor String
    | SelectWidth Int


update : Msg -> Model r -> ( Model r, Action )
update msg model =
    case msg of
        SelectColor str ->
            ( { model | coastlines_color = str }, SetColor str )

        SelectWidth n ->
            ( { model | coastlines_width = n }, SetWidth n )



-- API


type NaturalEarthFeature
    = Coastline
    | Lake
    | Border
    | DisputedBorder


encode : NaturalEarthFeature -> Json.Encode.Value
encode feature =
    Json.Encode.string (toString feature)


decoder : Decoder NaturalEarthFeature
decoder =
    Json.Decode.string
        |> Json.Decode.andThen
            (\str ->
                case str of
                    "coastlines" ->
                        Json.Decode.succeed Coastline

                    "borders" ->
                        Json.Decode.succeed Border

                    "disputed" ->
                        Json.Decode.succeed DisputedBorder

                    "lakes" ->
                        Json.Decode.succeed Lake

                    _ ->
                        Json.Decode.fail "unrecognised feature"
            )


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


endpoint : NaturalEarthFeature -> BoundingBox -> Scale -> String
endpoint feature box scale =
    let
        path =
            Endpoint.format
                [ "natural_earth_feature"
                , category feature
                , name feature
                ]
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
