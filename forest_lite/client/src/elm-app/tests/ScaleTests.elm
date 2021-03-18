module ScaleTests exposing (..)

import Expect exposing (Expectation)
import Scale exposing (truncateZoomLevel)
import Test exposing (..)
import ZoomLevel exposing (ZoomLevel)


scaleTests : Test
scaleTests =
    describe "truncateZoomLevel"
        [ test "given 2 returns 1" <|
            \_ ->
                ZoomLevel.ZoomLevel 2
                    |> truncateZoomLevel
                    |> Expect.equal (ZoomLevel.ZoomLevel 1)
        , test "given 4 returns 3" <|
            \_ ->
                ZoomLevel.ZoomLevel 4
                    |> truncateZoomLevel
                    |> Expect.equal (ZoomLevel.ZoomLevel 3)
        , test "given 6 returns 5" <|
            \_ ->
                ZoomLevel.ZoomLevel 6
                    |> truncateZoomLevel
                    |> Expect.equal (ZoomLevel.ZoomLevel 5)
        ]
