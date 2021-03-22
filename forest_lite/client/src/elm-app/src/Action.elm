module Action exposing (toString)

import Json.Encode


toString : String -> Json.Encode.Value -> String
toString key payload =
    Json.Encode.encode 0
        (Json.Encode.object
            [ ( "type", Json.Encode.string key )
            , ( "payload", payload )
            ]
        )
