module Example exposing (..)

import Expect exposing (Expectation)
import Fuzz exposing (Fuzzer, int, intRange, list, string)
import MapExtent exposing (quadkey, toOneIndex, toTiles, xyzFromInt)
import Test exposing (..)


quadkeyTests : Test
quadkeyTests =
    describe "Quadkey"
        [ test "given 000" <|
            \_ ->
                quadkey (xyzFromInt 0 0 0)
                    |> Expect.equal (MapExtent.Quadkey "0")
        , test "given 011" <|
            \_ ->
                quadkey (xyzFromInt 0 1 1)
                    |> Expect.equal (MapExtent.Quadkey "2")
        , test "given 355" <|
            \_ ->
                quadkey (xyzFromInt 3 5 5)
                    |> Expect.equal (MapExtent.Quadkey "00213")
        , fuzz (intRange 1 24) "length of quadkey equals level" <|
            \n ->
                quadkey (xyzFromInt 0 0 n)
                    |> MapExtent.quadkeyToString
                    |> String.length
                    |> Expect.equal n
        ]


zoomLevelTests : Test
zoomLevelTests =
    describe "ZoomLevel"
        [ test "toOneIndex given ZeroIndex"
            (\_ ->
                toOneIndex (MapExtent.ZeroIndex 0)
                    |> Expect.equal (MapExtent.OneIndex 1)
            )
        , test "toOneIndex given ZeroIndex 99"
            (\_ ->
                toOneIndex (MapExtent.ZeroIndex 99)
                    |> Expect.equal (MapExtent.OneIndex 100)
            )
        ]


extentToTilesTests : Test
extentToTilesTests =
    test "toTiles given an extent and a level" <|
        \_ ->
            let
                level =
                    MapExtent.ZoomLevel 0

                south_west =
                    MapExtent.WebMercator 0 0

                north_east =
                    MapExtent.WebMercator 1 1

                viewport =
                    MapExtent.Viewport south_west north_east
            in
            toTiles level viewport
                |> Expect.equal []
