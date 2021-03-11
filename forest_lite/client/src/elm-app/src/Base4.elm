module Base4 exposing (fromString, toDecimal)


type Base4
    = Base4 (List Int)


fromString : String -> Base4
fromString str =
    -- TODO add validation here
    let
        ints =
            str
                |> String.split ""
                |> List.map String.toInt
                |> List.map (Maybe.withDefault (floor 0))
    in
    Base4 ints


toDecimal : Base4 -> Int
toDecimal (Base4 ints) =
    let
        position =
            List.length ints - 1
    in
    convert ints position


convert : List Int -> Int -> Int
convert digits position =
    case digits of
        [] ->
            0

        head :: tail ->
            (head * (4 ^ position)) + convert tail (position - 1)
