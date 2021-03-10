module Quadkey exposing (Quadkey, encode, fromXY, fromZXY, toString)

import Binary
import Json.Encode
import ZXY exposing (XY, ZXY)
import ZoomLevel exposing (ZoomLevel)


type Quadkey
    = Quadkey String


encode : Quadkey -> Json.Encode.Value
encode (Quadkey str) =
    Json.Encode.string str


toString : Quadkey -> String
toString (Quadkey str) =
    str


fromZXY : ZXY -> Quadkey
fromZXY (ZXY.ZXY level xy) =
    fromXY level xy


fromXY : ZoomLevel -> XY -> Quadkey
fromXY level (ZXY.XY x y) =
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
