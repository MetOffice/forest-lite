module Example exposing (..)

import Expect exposing (Expectation)
import Fuzz exposing (Fuzzer, int, intRange, list, string)
import MapExtent
    exposing
        ( earthRadius
        , toZXY
        , xy
        , xyRange
        , zxy
        , zxyToExtent
        )
import Quadkey exposing (Quadkey)
import Test exposing (..)
import Viewport
import WebMercator exposing (WebMercator)
import ZoomLevel exposing (ZoomLevel)


quadkeyTests : Test
quadkeyTests =
    describe "Quadkey"
        [ test "given 000" <|
            \_ ->
                Quadkey.fromZXY (zxy 0 0 0)
                    |> Expect.equal (Quadkey.fromString "0")
        , test "given 011" <|
            \_ ->
                Quadkey.fromZXY (zxy 1 0 1)
                    |> Expect.equal (Quadkey.fromString "2")
        , test "given 355" <|
            \_ ->
                Quadkey.fromZXY (zxy 5 3 5)
                    |> Expect.equal (Quadkey.fromString "00213")
        , fuzz (intRange 1 24) "length of quadkey equals level" <|
            \n ->
                Quadkey.fromZXY (zxy n 0 0)
                    |> Quadkey.toString
                    |> String.length
                    |> Expect.equal n
        ]


quadkeyToZoomLevelTests : Test
quadkeyToZoomLevelTests =
    describe "Quadkey toZoomLevel"
        [ test "given 212 returns 3" <|
            \_ ->
                let
                    key =
                        Quadkey.fromString "212"
                in
                Quadkey.toZoomLevel key
                    |> Expect.equal (ZoomLevel.ZoomLevel 3)
        ]


quadkeyToXYTests : Test
quadkeyToXYTests =
    describe "Quadkey toXY"
        [ test "given 213 returns 3 5" <|
            \_ ->
                let
                    key =
                        Quadkey.fromString "213"
                in
                Quadkey.toXY key
                    |> Expect.equal (MapExtent.xy 3 5)
        , test "round trip preserves x y" <|
            \_ ->
                let
                    z =
                        5

                    x =
                        5

                    y =
                        3

                    key =
                        Quadkey.fromXY (ZoomLevel.ZoomLevel z) (MapExtent.xy x y)
                in
                Quadkey.toXY key
                    |> Expect.equal (MapExtent.xy x y)
        ]


zoomLevelTests : Test
zoomLevelTests =
    test "zoomLevel" <|
        \_ ->
            let
                start =
                    WebMercator
                        (-pi * earthRadius)
                        (-pi * earthRadius)

                end =
                    WebMercator
                        (pi * earthRadius)
                        (pi * earthRadius)

                viewport =
                    Viewport.Viewport start end
            in
            MapExtent.viewportToZoomLevel viewport
                |> Expect.equal (ZoomLevel.ZoomLevel 0)


xyTests : Test
xyTests =
    test "xyRange" <|
        \_ ->
            xyRange (xy 0 0) (xy 1 1)
                |> Expect.equal
                    [ xy 0 0
                    , xy 0 1
                    , xy 1 0
                    , xy 1 1
                    ]


zxyToExtentTests : Test
zxyToExtentTests =
    describe "calculate tile extents"
        [ test "level 0 tile extent" <|
            \_ ->
                let
                    start =
                        WebMercator
                            (-pi * earthRadius)
                            (pi * earthRadius)

                    end =
                        WebMercator
                            (pi * earthRadius)
                            (-pi * earthRadius)

                    expect =
                        Viewport.Viewport start end
                in
                zxyToExtent (zxy 0 0 0)
                    |> Expect.equal expect
        , test "level 1 tile extent" <|
            \_ ->
                let
                    start =
                        WebMercator
                            (-pi * earthRadius)
                            (pi * earthRadius)

                    end =
                        WebMercator 0 0

                    expect =
                        Viewport.Viewport start end
                in
                zxyToExtent (zxy 1 0 0)
                    |> Expect.equal expect
        , test "level 2 tile extent" <|
            \_ ->
                let
                    start =
                        WebMercator
                            (-pi * earthRadius)
                            (pi * earthRadius)

                    end =
                        WebMercator
                            (-pi * earthRadius / 2)
                            (pi * earthRadius / 2)

                    expect =
                        Viewport.Viewport start end
                in
                zxyToExtent (zxy 2 0 0)
                    |> Expect.equal expect
        , test "level 2 tile extent given xy 1 0" <|
            \_ ->
                let
                    start =
                        WebMercator
                            (-pi * earthRadius / 2)
                            (pi * earthRadius)

                    end =
                        WebMercator
                            0
                            (pi * earthRadius / 2)

                    expect =
                        Viewport.Viewport start end
                in
                zxyToExtent (zxy 2 1 0)
                    |> Expect.equal expect
        ]


toZXYTests : Test
toZXYTests =
    test "toZXY should preserve tile index" <|
        \_ ->
            let
                tile =
                    zxy 2 1 2

                point =
                    zxyToExtent tile |> Viewport.getStart
            in
            toZXY (ZoomLevel.ZoomLevel 2) point
                |> Expect.equal tile
