module MapExtent exposing (..)


type MapExtent
    = MapExtent Float Float Float Float
    | NotReady


init : MapExtent
init =
    NotReady



-- SLIPPY MAP


type XYZ
    = XYZ Int Int Int


type Viewport
    = Viewport WebMercator WebMercator


viewportFromFloat : Float -> Float -> Float -> Float -> Viewport
viewportFromFloat x_start y_start x_end y_end =
    let
        start =
            { x = x_start, y = y_start }

        end =
            { x = x_end, y = y_end }
    in
    Viewport start end


zoomLevel : Viewport -> Int
zoomLevel viewport =
    let
        maximum_length =
            2 * pi * earthRadius
    in
    ceiling (logBase 2 (maximum_length / averageLength viewport))


averageLength : Viewport -> Float
averageLength (Viewport start end) =
    sqrt ((start.x - end.x) * (start.y - end.y))


toXYZ : Int -> WebMercator -> XYZ
toXYZ level point =
    XYZ (tileIndex level point.x) (tileIndex level point.y) level


tileIndex : Int -> Float -> Int
tileIndex level x =
    let
        dx =
            (2 * pi * earthRadius) / toFloat (2 ^ level)
    in
    floor (x / dx)



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
