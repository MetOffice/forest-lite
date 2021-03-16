module Scale exposing (fromExtent, fromZoomLevel, toString)

import ZoomLevel exposing (ZoomLevel)


type Scale
    = Large
    | Medium
    | Small


fromExtent : Float -> Float -> Float -> Float -> Scale
fromExtent x_start x_end y_start y_end =
    if abs (x_end - x_start) < 45 then
        Small

    else if abs (x_end - x_start) < 90 then
        Medium

    else
        Large


fromZoomLevel : ZoomLevel -> Scale
fromZoomLevel level =
    let
        n =
            ZoomLevel.toInt level
    in
    if n > 4 then
        Small

    else if n > 2 then
        Medium

    else
        Large


toString : Scale -> String
toString scale =
    case scale of
        Large ->
            "110m"

        Medium ->
            "50m"

        Small ->
            "10m"
