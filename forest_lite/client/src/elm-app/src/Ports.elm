port module Ports exposing (receiveData, sendAction)

import Json.Decode


port receiveData : (Json.Decode.Value -> msg) -> Sub msg


port sendAction : String -> Cmd msg
