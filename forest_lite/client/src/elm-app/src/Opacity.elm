module Opacity exposing
    ( Opacity
    , encode
    , fromFloat
    , fromString
    , opaque
    , toString
    )

import Json.Encode


type Opacity
    = Opacity Float


encode : Opacity -> Json.Encode.Value
encode (Opacity x) =
    Json.Encode.float x


opaque : Opacity
opaque =
    Opacity 1


fromFloat : Float -> Maybe Opacity
fromFloat x =
    if x > 1 then
        Nothing

    else if x < 0 then
        Nothing

    else
        Just (Opacity x)


fromString : String -> Maybe Opacity
fromString str =
    case String.toFloat str of
        Nothing ->
            Nothing

        Just x ->
            fromFloat x


toString : Opacity -> String
toString (Opacity x) =
    String.fromFloat x
