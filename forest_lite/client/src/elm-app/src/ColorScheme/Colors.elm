module ColorScheme.Colors exposing (Colors, fromList, toList)


type Colors
    = Colors (List String)


fromList : List String -> Colors
fromList strs =
    Colors strs


toList : Colors -> List String
toList (Colors strs) =
    strs
