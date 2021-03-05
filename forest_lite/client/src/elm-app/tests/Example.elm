module Example exposing (..)

import Expect exposing (Expectation)
import Fuzz exposing (Fuzzer, int, intRange, list, string)
import MapExtent
    exposing
        ( WebMercator
        , earthRadius
        , quadkey
        , toOneIndex
        , xy
        , xyRange
        , zxy
        , zxyToExtent
        )
import Test exposing (..)


quadkeyTests : Test
quadkeyTests =
    describe "Quadkey"
        [ test "given 000" <|
            \_ ->
                quadkey (zxy 0 0 0)
                    |> Expect.equal (MapExtent.Quadkey "0")
        , test "given 011" <|
            \_ ->
                quadkey (zxy 1 0 1)
                    |> Expect.equal (MapExtent.Quadkey "2")
        , test "given 355" <|
            \_ ->
                quadkey (zxy 5 3 5)
                    |> Expect.equal (MapExtent.Quadkey "00213")
        , fuzz (intRange 1 24) "length of quadkey equals level" <|
            \n ->
                quadkey (zxy n 0 0)
                    |> MapExtent.quadkeyToString
                    |> String.length
                    |> Expect.equal n
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
                    MapExtent.Viewport start end
            in
            MapExtent.zoomLevelFromViewport viewport
                |> Expect.equal (MapExtent.ZoomLevel 0)


indexTests : Test
indexTests =
    describe "One-based index"
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
                        MapExtent.Viewport start end
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
                        MapExtent.Viewport start end
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
                        MapExtent.Viewport start end
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
                        MapExtent.Viewport start end
                in
                zxyToExtent (zxy 2 1 0)
                    |> Expect.equal expect
        ]
