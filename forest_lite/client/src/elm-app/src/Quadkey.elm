module Quadkey exposing
    ( Quadkey
    , decoder
    , encode
    , fromString
    , fromXY
    , fromZXY
    , toString
    , toXY
    , toZoomLevel
    )

import Binary
import Json.Decode exposing (Decoder)
import Json.Encode
import Regex
import ZXY exposing (XY, ZXY)
import ZoomLevel exposing (ZoomLevel)


type Quadkey
    = Quadkey String


fromString : String -> Quadkey
fromString str =
    -- TODO add validation here
    Quadkey str


encode : Quadkey -> Json.Encode.Value
encode (Quadkey str) =
    Json.Encode.string str


decoder : Decoder Quadkey
decoder =
    Json.Decode.string
        |> Json.Decode.andThen
            (\str ->
                let
                    pattern =
                        "^[0123]+$"

                    regex =
                        Maybe.withDefault Regex.never (Regex.fromString pattern)

                    contains =
                        Regex.contains regex str
                in
                case contains of
                    True ->
                        Json.Decode.succeed (Quadkey str)

                    False ->
                        Json.Decode.fail "invalid quadkey"
            )


toString : Quadkey -> String
toString (Quadkey str) =
    str


toZoomLevel : Quadkey -> ZoomLevel
toZoomLevel (Quadkey str) =
    ZoomLevel.ZoomLevel (String.length str)


toXY : Quadkey -> XY
toXY _ =
    -- TODO replace with implementation
    ZXY.XY 0 0


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
