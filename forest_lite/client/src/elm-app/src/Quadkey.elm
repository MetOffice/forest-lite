module Quadkey exposing (Quadkey, toString)

import Binary
import ZXY exposing (XY, ZXY)
import ZoomLevel


type Quadkey
    = Quadkey String


toString : Quadkey -> String
toString (Quadkey str) =
    str


quadkey : ZXY -> Quadkey
quadkey (ZXY.ZXY level (ZXY.XY x y)) =
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
