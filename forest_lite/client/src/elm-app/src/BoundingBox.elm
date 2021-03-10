module BoundingBox exposing (BoundingBox, encode)

import Json.Encode


type alias BoundingBox =
    { minlon : Float
    , maxlon : Float
    , minlat : Float
    , maxlat : Float
    }


encode : BoundingBox -> Json.Encode.Value
encode box =
    Json.Encode.object
        [ ( "minlon", Json.Encode.float box.minlon )
        , ( "maxlon", Json.Encode.float box.maxlon )
        , ( "minlat", Json.Encode.float box.minlat )
        , ( "maxlat", Json.Encode.float box.maxlat )
        ]
