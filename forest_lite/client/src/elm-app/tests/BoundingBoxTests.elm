module BoundingBoxTests exposing (..)

import BoundingBox2d
import Expect exposing (Expectation, FloatingPointTolerance(..))
import Length exposing (meters)
import MapExtent exposing (earthRadius)
import Quadkey
import Test exposing (..)
import WebMercator exposing (toBoundingBox2d)


{-| Convert from BoundingBox to elm-geometry BoundingBox2d
-}
boundingBoxTests : Test
boundingBoxTests =
    test "toBoundingBox2d" <|
        \_ ->
            let
                quadkey =
                    Quadkey.fromString "1"

                z =
                    Quadkey.toZoomLevel quadkey

                xy =
                    Quadkey.toXY quadkey

                viewport =
                    MapExtent.xyToExtent z xy
            in
            toBoundingBox2d viewport
                |> Expect.equal
                    (BoundingBox2d.fromExtrema
                        { minX = meters 0
                        , maxX = meters (earthRadius * pi)
                        , minY = meters 0
                        , maxY = meters (earthRadius * pi)
                        }
                    )
