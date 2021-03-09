module ZoomLevel exposing (..)


type ZoomLevel
    = ZoomLevel Int


toInt : ZoomLevel -> Int
toInt (ZoomLevel n) =
    n


toString : ZoomLevel -> String
toString (ZoomLevel n) =
    String.fromInt n
