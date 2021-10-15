module ColorScheme.Rank exposing
    ( Rank
    , fromInt
    , fromString
    , toInt
    , toString
    )


type Rank
    = Rank Int


fromInt : Int -> Rank
fromInt n =
    Rank n


toInt : Rank -> Int
toInt (Rank n) =
    n


fromString : String -> Maybe Rank
fromString str =
    case String.toInt str of
        Nothing ->
            Nothing

        Just n ->
            Just (Rank n)


toString : Rank -> String
toString (Rank n) =
    String.fromInt n
