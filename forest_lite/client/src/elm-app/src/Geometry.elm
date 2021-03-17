module Geometry exposing (..)

import Axis2d
import BoundingBox2d exposing (BoundingBox2d)
import Length exposing (Meters)
import LineSegment2d exposing (LineSegment2d)
import MultiLine exposing (MultiLine)
import Point2d exposing (Point2d)
import Polyline2d exposing (Polyline2d)
import Quantity


{-| Clip Bokeh multilines overlapping with BoundingBox2d
-}
clip : BoundingBox2d Meters coordinates -> MultiLine -> MultiLine
clip box bokeh_lines =
    bokeh_lines
        |> toPolyline2d
        |> List.map (clipPolyline2d box)
        |> List.concat
        |> fromPolyline2d


{-| Remove line segments completely outside bounding box
-}
clipPolyline2d :
    BoundingBox2d Meters coordinates
    -> Polyline2d Meters coordinates
    -> List (Polyline2d Meters coordinates)
clipPolyline2d box polyline =
    polyline
        |> Polyline2d.segments
        |> cut (overlapsWith box)
        |> List.map toVertices
        |> List.map Polyline2d.fromVertices


toVertices : List (LineSegment2d units coords) -> List (Point2d units coords)
toVertices segments =
    case segments of
        [] ->
            []

        head :: _ ->
            LineSegment2d.startPoint head
                :: (segments
                        |> List.map LineSegment2d.endPoint
                   )


{-| Check segment and box overlap
-}
overlapsWith :
    BoundingBox2d units coordinates
    -> LineSegment2d units coordinates
    -> Bool
overlapsWith box segment =
    let
        start =
            LineSegment2d.startPoint segment

        end =
            LineSegment2d.endPoint segment
    in
    BoundingBox2d.contains start box
        || BoundingBox2d.contains end box


{-| Convert from Bokeh Multiline to elm-geometry Polyline2d
-}
toPolyline2d : MultiLine -> List (Polyline2d Meters coordinates)
toPolyline2d { xs, ys } =
    List.map2 converter xs ys


converter : List Float -> List Float -> Polyline2d Meters coordinates
converter x y =
    let
        points =
            List.map2 Point2d.meters x y
    in
    Polyline2d.fromVertices points


fromPolyline2d : List (Polyline2d Meters coordinates) -> MultiLine
fromPolyline2d polylines =
    let
        -- NOTE conversion to raw Floats loses unit information
        xs =
            polylines
                |> List.map Polyline2d.vertices
                |> List.map
                    (List.map
                        (Point2d.xCoordinate
                            >> Quantity.unwrap
                        )
                    )

        ys =
            polylines
                |> List.map Polyline2d.vertices
                |> List.map
                    (List.map
                        (Point2d.yCoordinate
                            >> Quantity.unwrap
                        )
                    )
    in
    { xs = xs, ys = ys }


{-| Cut list into smaller lists given a criteria
-}
cut : (a -> Bool) -> List a -> List (List a)
cut f items =
    cutHelper f (List.reverse items) [] []


cutHelper : (a -> Bool) -> List a -> List (List a) -> List a -> List (List a)
cutHelper f items result group =
    case items of
        [] ->
            case group of
                [] ->
                    result

                _ ->
                    group :: result

        x :: xs ->
            if f x then
                -- APPEND X TO GROUP
                cutHelper f xs result (x :: group)

            else
                -- SKIP X AND RESET GROUP
                case group of
                    [] ->
                        cutHelper f xs result []

                    _ ->
                        cutHelper f xs (group :: result) []
