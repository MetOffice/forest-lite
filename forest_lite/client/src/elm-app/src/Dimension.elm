module Dimension exposing (Dimension, SelectPoint, get, view)

import Datum exposing (Datum)
import Dict exposing (Dict)
import Dimension.Kind exposing (Kind(..))
import Dimension.Label exposing (Label)
import Helpers exposing (onSelect)
import Html exposing (Html, div, label, option, select, text)
import Html.Attributes exposing (attribute, class, selected)
import Json.Encode
import Point exposing (Point)
import Timestamp


type alias Dimension =
    { label : Dimension.Label.Label
    , points : List Datum
    , kind : Dimension.Kind.Kind
    }


type alias SelectPoint =
    { dim_name : Dimension.Label.Label
    , point : Datum
    }



-- DICT HELPERS


get : Dict String Dimension -> Dimension.Label.Label -> Maybe Dimension
get dimensions dim_name =
    let
        key =
            Dimension.Label.toString dim_name
    in
    Dict.get key dimensions



-- VIEW


view : (String -> msg) -> Maybe Point -> Dimension -> Html msg
view toMsg maybePoint dim =
    let
        str =
            Dimension.Label.toString dim.label

        actives =
            List.map (isActive maybePoint dim) dim.points
    in
    case dim.kind of
        Horizontal ->
            text ""

        _ ->
            div [ class "select__container" ]
                [ label [ class "select__label" ] [ text ("Dimension: " ++ str) ]
                , div
                    []
                    [ select
                        [ onSelect toMsg
                        , class "select__select"
                        ]
                        (option [] [ text "Please select" ]
                            :: List.map2
                                (viewPoint dim)
                                actives
                                dim.points
                        )
                    ]
                ]


viewPoint : Dimension -> Bool -> Datum -> Html msg
viewPoint dim active datum =
    let
        content =
            toString dim.kind datum

        value =
            Json.Encode.encode 0 (encodePoint dim.label datum)
    in
    option
        [ attribute "value" value
        , selected active
        ]
        [ text content ]


isActive : Maybe Point -> Dimension -> Datum -> Bool
isActive maybePoint dim datum =
    case maybePoint of
        Nothing ->
            False

        Just point ->
            let
                key =
                    Dimension.Label.toString dim.label
            in
            case Dict.get key point of
                Nothing ->
                    False

                Just pointDatum ->
                    Json.Encode.encode 0 (Datum.encode datum)
                        == Json.Encode.encode 0 (Datum.encode pointDatum)


toString : Dimension.Kind.Kind -> Datum -> String
toString kind point =
    case kind of
        Numeric ->
            Datum.toString point

        Temporal ->
            Timestamp.format (Datum.toInt point)

        Horizontal ->
            Datum.toString point



-- SELECT POINT


encodePoint : Dimension.Label.Label -> Datum -> Json.Encode.Value
encodePoint dim_name point =
    Json.Encode.object
        [ ( "dim_name", Dimension.Label.encode dim_name )
        , ( "point", Datum.encode point )
        ]
