module MapExtent exposing (..)

import Binary
import Viewport exposing (Viewport)
import ZoomLevel exposing (ZoomLevel)



-- SLIPPY MAP


type alias Box =
    { minlon : Float
    , maxlon : Float
    , minlat : Float
    , maxlat : Float
    }


type ZXY
    = ZXY ZoomLevel XY


type XY
    = XY Int Int


xy : Int -> Int -> XY
xy x y =
    XY x y


zxy : Int -> Int -> Int -> ZXY
zxy z x y =
    ZXY (ZoomLevel.ZoomLevel z) (XY x y)


zxyToExtent : ZXY -> Viewport WebMercator
zxyToExtent (ZXY level point) =
    xyToExtent level point


xyToString : XY -> String
xyToString (XY x y) =
    let
        xs =
            String.fromInt x

        ys =
            String.fromInt y
    in
    "(" ++ xs ++ ", " ++ ys ++ ")"


xyToExtent : ZoomLevel -> XY -> Viewport WebMercator
xyToExtent (ZoomLevel.ZoomLevel z) (XY i j) =
    Viewport.Viewport
        (vertexLocation z i j)
        (vertexLocation z (i + 1) (j + 1))


vertexLocation : Int -> Int -> Int -> WebMercator
vertexLocation z i j =
    let
        x0 =
            -pi * earthRadius

        y0 =
            pi * earthRadius

        x =
            toFloat i

        y =
            toFloat j

        width =
            (2 * pi * earthRadius) / (2 ^ toFloat z)
    in
    WebMercator (x0 + x * width) (y0 - y * width)


toBox : ZoomLevel -> XY -> Box
toBox level xy_index =
    xyToExtent level xy_index
        |> Viewport.map toWGS84
        |> viewportToBox


viewportToBox : Viewport WGS84 -> Box
viewportToBox (Viewport.Viewport start end) =
    { minlon = min start.longitude end.longitude
    , maxlon = max start.longitude end.longitude
    , minlat = min start.latitude end.latitude
    , maxlat = max start.latitude end.latitude
    }


tiles : ZoomLevel -> Viewport WebMercator -> List XY
tiles level (Viewport.Viewport start end) =
    let
        -- Flip diagonal direction to satisfy assumptions
        north_west =
            WebMercator start.x end.y

        south_east =
            WebMercator end.x start.y
    in
    xyRange (toXY level north_west) (toXY level south_east)


xyRange : XY -> XY -> List XY
xyRange (XY x_start y_start) (XY x_end y_end) =
    let
        xs =
            List.range x_start x_end

        ys =
            List.range y_start y_end
    in
    nested xy xs ys


{-| Application of operation on cartesian product of two lists

A helper to make it easy to combine multiple combinations
of lists into a single list using a binary operation

-}
nested : (a -> b -> c) -> List a -> List b -> List c
nested op x y =
    List.map (\f -> List.map f y) (List.map op x) |> List.concat


viewportFromFloat : Float -> Float -> Float -> Float -> Viewport WebMercator
viewportFromFloat x_start y_start x_end y_end =
    let
        start =
            { x = x_start, y = y_start }

        end =
            { x = x_end, y = y_end }
    in
    Viewport.Viewport start end


viewportToZoomLevel : Viewport WebMercator -> ZoomLevel
viewportToZoomLevel viewport =
    let
        maximum_length =
            2 * pi * earthRadius
    in
    ceiling (logBase 2 (maximum_length / averageLength viewport))
        |> ZoomLevel.ZoomLevel


averageLength : Viewport WebMercator -> Float
averageLength (Viewport.Viewport start end) =
    sqrt ((start.x - end.x) * (start.y - end.y))


toZXY : ZoomLevel -> WebMercator -> ZXY
toZXY level point =
    ZXY level (toXY level point)


toXY : ZoomLevel -> WebMercator -> XY
toXY level point =
    let
        x0 =
            -pi * earthRadius

        y0 =
            pi * earthRadius

        n =
            ZoomLevel.toInt level

        dx =
            (2 * pi * earthRadius) / toFloat (2 ^ n)

        dy =
            -dx

        x =
            bucketIndex x0 dx point.x

        y =
            bucketIndex y0 dy point.y
    in
    XY x y


bucketIndex : Float -> Float -> Float -> Int
bucketIndex x0 dx x =
    floor ((x - x0) / dx)



-- QUADKEY


type Quadkey
    = Quadkey String


quadkeyToString : Quadkey -> String
quadkeyToString (Quadkey str) =
    str


quadkey : ZXY -> Quadkey
quadkey (ZXY level (XY x y)) =
    let
        length =
            ZoomLevel.toInt level

        x_ints =
            Binary.fromDecimal x
                |> Binary.toIntegers
                |> zeroPad length

        y_ints =
            Binary.fromDecimal y
                |> Binary.toIntegers
                |> zeroPad length

        base4_ints =
            List.map2 (+) x_ints (List.map ((*) 2) y_ints)

        base4_strs =
            List.map String.fromInt base4_ints
    in
    Quadkey (String.join "" base4_strs)


zeroPad : Int -> List Int -> List Int
zeroPad length array =
    let
        extra =
            length - List.length array
    in
    if extra > 0 then
        List.repeat extra 0 ++ array

    else
        array



-- WEB MERCATOR


type alias WGS84 =
    { longitude : Float
    , latitude : Float
    }


type alias WebMercator =
    { x : Float
    , y : Float
    }


earthRadius : Float
earthRadius =
    6378137.0


xLimits : ( Float, Float )
xLimits =
    ( -pi * earthRadius, pi * earthRadius )


yLimits : ( Float, Float )
yLimits =
    ( -pi * earthRadius, pi * earthRadius )


toWGS84 : WebMercator -> WGS84
toWGS84 coord =
    { longitude = toLon coord.x
    , latitude = toLat coord.y
    }


toLon : Float -> Float
toLon x =
    toDeg (x / earthRadius)


toLat : Float -> Float
toLat y =
    toDeg (atan (sinh (y / earthRadius)))


toDeg : Float -> Float
toDeg radians =
    radians * (180 / pi)



-- MATH


sinh : Float -> Float
sinh x =
    (e ^ x - e ^ -x) / 2
