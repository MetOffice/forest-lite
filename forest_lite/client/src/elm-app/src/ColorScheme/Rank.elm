module ColorScheme.Rank exposing (Rank, fromInt, toInt)


type Rank
    = Rank Int


fromInt : Int -> Rank
fromInt n =
    Rank n


toInt : Rank -> Int
toInt (Rank n) =
    n
