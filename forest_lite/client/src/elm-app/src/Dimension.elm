module Dimension exposing (Dimension, SelectPoint, get, view)

import Datum exposing (Datum)
import Dict exposing (Dict)
import Dimension.Kind exposing (Kind(..))
import Dimension.Label exposing (Label)
import Helpers exposing (onSelect)
import Html exposing (Html, div, label, option, select, text)
import Html.Attributes exposing (attribute, class)
import Json.Encode
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


view : (String -> msg) -> Dimension -> Html msg
view toMsg dim =
    let
        str =
            Dimension.Label.toString dim.label
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
                        (List.map (viewPoint dim) dim.points)
                    ]
                ]


viewPoint : Dimension -> Datum -> Html msg
viewPoint dim point =
    let
        kind =
            dim.kind

        dim_name =
            dim.label

        value =
            pointToString { dim_name = dim_name, point = point }
    in
    option [ attribute "value" value ] [ text (toString kind point) ]


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


pointToString : SelectPoint -> String
pointToString props =
    Json.Encode.encode 0
        (Json.Encode.object
            [ ( "dim_name", Dimension.Label.encode props.dim_name )
            , ( "point", Datum.encode props.point )
            ]
        )
