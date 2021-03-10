module ZXY exposing (XY(..), ZXY(..), xyToString)

import ZoomLevel exposing (ZoomLevel)


type ZXY
    = ZXY ZoomLevel XY


type XY
    = XY Int Int


xyToString : XY -> String
xyToString (XY x y) =
    let
        xs =
            String.fromInt x

        ys =
            String.fromInt y
    in
    "(" ++ xs ++ ", " ++ ys ++ ")"
