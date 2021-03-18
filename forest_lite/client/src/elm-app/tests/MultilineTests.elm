module MultilineTests exposing (..)

import Angle
import Axis2d
import BoundingBox2d exposing (BoundingBox2d)
import Direction2d
import Expect
    exposing
        ( Expectation
        , FloatingPointTolerance(..)
        )
import Geometry exposing (overlapsWith, toPolyline2d)
import Length exposing (Meters)
import LineSegment2d exposing (LineSegment2d)
import Point2d
import Polyline2d exposing (Polyline2d)
import Test exposing (..)


{-| Learning tests to understand elm-units
-}
angleTests : Test
angleTests =
    test "inRadians" <|
        \_ ->
            let
                angle =
                    Angle.degrees 180
            in
            angle
                |> Angle.inRadians
                |> Expect.within (Absolute 1.0e-6) pi


{-| Learning tests to understand elm-geometry
-}
elmGeometryTests : Test
elmGeometryTests =
    describe "elm-geometry"
        [ test "intersectionWithAxis inside segment" <|
            \_ ->
                let
                    start =
                        Point2d.meters 0 0

                    end =
                        Point2d.meters 0 1

                    x =
                        0.5

                    axis =
                        Axis2d.through
                            (Point2d.meters 0 x)
                            (Direction2d.degrees 0)

                    segment =
                        LineSegment2d.from start end
                in
                segment
                    |> LineSegment2d.intersectionWithAxis axis
                    |> Expect.equal (Just (Point2d.meters 0 x))
        , test "intersectionWithAxis outside segment" <|
            \_ ->
                let
                    start =
                        Point2d.meters 0 0

                    end =
                        Point2d.meters 0 1

                    axis =
                        Axis2d.through
                            (Point2d.meters 0 1.1)
                            (Direction2d.degrees 0)

                    segment =
                        LineSegment2d.from start end
                in
                segment
                    |> LineSegment2d.intersectionWithAxis axis
                    |> Expect.equal Nothing
        , test "BoundingBox contains point" <|
            \_ ->
                let
                    box =
                        BoundingBox2d.fromExtrema
                            { minX = Length.meters 0
                            , maxX = Length.meters 1
                            , minY = Length.meters 0
                            , maxY = Length.meters 1
                            }

                    point =
                        Point2d.meters 0.5 0.5
                in
                BoundingBox2d.contains point box
                    |> Expect.equal True
        , test "BoundingBox overlaps segment" <|
            \_ ->
                let
                    box =
                        BoundingBox2d.fromExtrema
                            { minX = Length.meters 0
                            , maxX = Length.meters 1
                            , minY = Length.meters 0
                            , maxY = Length.meters 1
                            }

                    segment =
                        LineSegment2d.from
                            (Point2d.meters 0.5 0.5)
                            (Point2d.meters 1.5 0.5)
                in
                overlapsWith box segment
                    |> Expect.equal True
        , test "Polyline2d segments" <|
            \_ ->
                let
                    points =
                        Polyline2d.fromVertices
                            [ Point2d.meters 0 0
                            , Point2d.meters 1 0
                            , Point2d.meters 2 0
                            ]
                in
                points
                    |> Polyline2d.segments
                    |> Expect.equal
                        [ LineSegment2d.from
                            (Point2d.meters 0 0)
                            (Point2d.meters 1 0)
                        , LineSegment2d.from
                            (Point2d.meters 1 0)
                            (Point2d.meters 2 0)
                        ]
        , test "Polyline2d intersectWithAxis" <|
            \_ ->
                let
                    points =
                        Polyline2d.fromVertices
                            [ Point2d.meters 0 0
                            , Point2d.meters 1 0
                            , Point2d.meters 2 0
                            ]

                    x =
                        1.9

                    axis =
                        Axis2d.through
                            (Point2d.meters x 0)
                            (Direction2d.degrees 90)

                    intersection =
                        LineSegment2d.intersectionWithAxis axis
                in
                points
                    |> Polyline2d.segments
                    |> List.map intersection
                    |> Expect.equal
                        [ Nothing
                        , Just (Point2d.meters x 0)
                        ]
        ]


{-| Conversion from Bokeh format to elm-geometry and back
-}
conversionTests : Test
conversionTests =
    describe "MultiLine format conversion"
        [ test "toPolyline2d" <|
            \_ ->
                let
                    lines =
                        { xs = [ [ 1, 2, 3 ], [ 4, 5 ] ]
                        , ys = [ [ 6, 7, 8 ], [ 9, 10 ] ]
                        }
                in
                lines
                    |> toPolyline2d
                    |> Expect.equal
                        [ Polyline2d.fromVertices
                            [ Point2d.meters 1 6
                            , Point2d.meters 2 7
                            , Point2d.meters 3 8
                            ]
                        , Polyline2d.fromVertices
                            [ Point2d.meters 4 9
                            , Point2d.meters 5 10
                            ]
                        ]
        , test "List.map Polyline2d.segments" <|
            \_ ->
                let
                    lines =
                        { xs = [ [ 1, 2, 3 ], [ 4, 5 ] ]
                        , ys = [ [ 1, 2, 3 ], [ 4, 5 ] ]
                        }

                    box =
                        BoundingBox2d.fromExtrema
                            { minX = Length.meters 2.1
                            , maxX = Length.meters 3.9
                            , minY = Length.meters 2.1
                            , maxY = Length.meters 3.9
                            }
                in
                lines
                    |> Geometry.clip box
                    |> Expect.equal
                        { xs =
                            [ [ 2, 3 ]
                            ]
                        , ys =
                            [ [ 2, 3 ]
                            ]
                        }
        ]


cutTests : Test
cutTests =
    describe "cut"
        [ test "given always True" <|
            \_ ->
                Geometry.cut (\x -> True) [ 1, 2, 3 ]
                    |> Expect.equal [ [ 1, 2, 3 ] ]
        , test "given always False" <|
            \_ ->
                Geometry.cut (\x -> False) [ 1, 2, 3 ]
                    |> Expect.equal []
        , test "given isEven" <|
            \_ ->
                let
                    isEven x =
                        modBy 2 x == 0
                in
                Geometry.cut isEven [ 1, 2, 3, 4 ]
                    |> Expect.equal [ [ 2 ], [ 4 ] ]
        ]
