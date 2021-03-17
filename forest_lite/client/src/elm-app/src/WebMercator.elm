module WebMercator exposing (WebMercator, toBoundingBox2d)

import BoundingBox2d exposing (BoundingBox2d)
import Length exposing (Meters, meters)
import Viewport exposing (Viewport)


type alias WebMercator =
    { x : Float
    , y : Float
    }


{-| BoundingBox2d in WebMercator coordinates
-}
toBoundingBox2d : Viewport WebMercator -> BoundingBox2d Meters coordinates
toBoundingBox2d viewport =
    let
        start =
            Viewport.getStart viewport

        end =
            Viewport.getEnd viewport
    in
    BoundingBox2d.fromExtrema
        { minX = meters (min start.x end.x)
        , maxX = meters (max start.x end.x)
        , minY = meters (min start.y end.y)
        , maxY = meters (max start.y end.y)
        }
