module ColorScheme.Order exposing
    ( Order
    , arrange
    , fromBool
    , isRightToLeft
    , leftToRight
    , rightToLeft
    )


type Order
    = LeftToRight
    | RightToLeft


leftToRight : Order
leftToRight =
    LeftToRight


rightToLeft : Order
rightToLeft =
    RightToLeft


arrange : Order -> List a -> List a
arrange order items =
    case order of
        LeftToRight ->
            items

        RightToLeft ->
            List.reverse items


fromBool : Bool -> Order
fromBool flag =
    if flag then
        RightToLeft

    else
        LeftToRight


isRightToLeft : Order -> Bool
isRightToLeft order =
    case order of
        LeftToRight ->
            False

        RightToLeft ->
            True
