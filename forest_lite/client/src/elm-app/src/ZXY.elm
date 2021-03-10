module ZXY exposing (XY(..), ZXY(..))

import ZoomLevel exposing (ZoomLevel)


type ZXY
    = ZXY ZoomLevel XY


type XY
    = XY Int Int
