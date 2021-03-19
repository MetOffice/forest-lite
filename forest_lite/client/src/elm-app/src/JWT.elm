module JWT exposing (Claim, decoder)

import Json.Decode
    exposing
        ( Decoder
        , int
        , list
        , string
        )
import Json.Decode.Pipeline exposing (optional, required)


type alias Claim =
    { auth_time : Int
    , email : String
    , name : String
    , given_name : String
    , family_name : String
    , groups : List String
    , iat : Int
    , exp : Int
    }


decoder : Decoder Claim
decoder =
    Json.Decode.succeed Claim
        |> required "auth_time" int
        |> optional "email" string "Not provided"
        |> required "name" string
        |> required "given_name" string
        |> required "family_name" string
        |> required "groups" (list string)
        |> required "iat" int
        |> required "exp" int
