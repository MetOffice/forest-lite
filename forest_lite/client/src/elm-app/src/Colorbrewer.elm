module Colorbrewer exposing
    ( Color
    , diverging
    , multihue
    , qualitative
    , rgb255
    , singlehue
    , toHex
    , toRGB
    )


type Color
    = Color Int Int Int


rgb255 : Int -> Int -> Int -> Color
rgb255 r g b =
    Color r g b


toRGB : Color -> String
toRGB (Color r g b) =
    "rgb(" ++ String.join "," (List.map String.fromInt [ r, g, b ]) ++ ")"


toHex : Color -> String
toHex (Color r g b) =
    "#" ++ base16 r ++ base16 g ++ base16 b


base16 : Int -> String
base16 n =
    let
        first =
            n // 16

        second =
            remainderBy 16 n
    in
    toSymbol first ++ toSymbol second


toSymbol : Int -> String
toSymbol n =
    case n of
        0 ->
            "0"

        1 ->
            "1"

        2 ->
            "2"

        3 ->
            "3"

        4 ->
            "4"

        5 ->
            "5"

        6 ->
            "6"

        7 ->
            "7"

        8 ->
            "8"

        9 ->
            "9"

        10 ->
            "A"

        11 ->
            "B"

        12 ->
            "C"

        13 ->
            "D"

        14 ->
            "E"

        15 ->
            "F"

        _ ->
            ""


type Palette
    = MultiHue MultiHue
    | SingleHue SingleHue
    | Qualitative Qualitative
    | Diverging Diverging Int


type MultiHue
    = YlGn
    | YlGnBu
    | GnBu
    | BuGn
    | PuBuGn
    | PuBu
    | BuPu
    | RdPu
    | PuRd
    | OrRd
    | YlOrRd
    | YlOrBu
    | YlOrBr


multihue : List Palette
multihue =
    List.map MultiHue
        [ YlGn
        , YlGnBu
        , GnBu
        , BuGn
        , PuBuGn
        , PuBu
        , BuPu
        , RdPu
        , PuRd
        , OrRd
        , YlOrRd
        , YlOrBu
        , YlOrBr
        ]


type SingleHue
    = Purples
    | Blues
    | Greens
    | Oranges
    | Reds
    | Greys


singlehue : List Palette
singlehue =
    List.map SingleHue
        [ Purples
        , Blues
        , Greens
        , Oranges
        , Reds
        , Greys
        ]


type Diverging
    = PuOr
    | BrBG
    | PRGn
    | PiYG
    | RdBu
    | RdYlBu
    | RdYlGn
    | RdGy
    | Spectral


diverging : Int -> List Palette
diverging n =
    List.map (\c -> Diverging c n)
        [ PuOr
        , BrBG
        , PRGn
        , PiYG
        , RdBu
        , RdYlBu
        , RdYlGn
        , RdGy
        , Spectral
        ]


type Qualitative
    = Accent
    | Dark2
    | Paired
    | Pastel2
    | Pastel1
    | Set1
    | Set2
    | Set3


qualitative : List Palette
qualitative =
    List.map Qualitative
        [ Accent
        , Dark2
        , Paired
        , Pastel2
        , Pastel1
        , Set1
        , Set2
        , Set3
        ]
