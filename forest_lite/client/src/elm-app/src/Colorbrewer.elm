module Colorbrewer exposing
    ( Color
    , all
    , diverging
    , multihue
    , qualitative
    , rgb255
    , singlehue
    , spectral
    , toColors
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


toColors : Palette -> List Color
toColors palette =
    case palette of
        MultiHue tag ->
            toMultihueColors tag

        Diverging tag n ->
            toDivergingColors tag n

        _ ->
            []


spectral : Int -> Palette
spectral n =
    Diverging Spectral n


type Palette
    = MultiHue MultiHue
    | SingleHue SingleHue
    | Qualitative Qualitative
    | Diverging Diverging Int


all : List Palette
all =
    singlehue ++ multihue ++ diverging 3 ++ qualitative


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


toMultihueColors : MultiHue -> List Color
toMultihueColors tag =
    case tag of
        YlGn ->
            [ rgb255 247 252 185
            , rgb255 173 221 142
            , rgb255 49 163 84
            ]

        _ ->
            []


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


toDivergingColors : Diverging -> Int -> List Color
toDivergingColors tag n =
    case tag of
        Spectral ->
            case n of
                6 ->
                    [ rgb255 213 62 79
                    , rgb255 252 141 89
                    , rgb255 254 224 139
                    , rgb255 230 245 152
                    , rgb255 153 213 148
                    , rgb255 50 136 189
                    ]

                5 ->
                    [ rgb255 215 25 28
                    , rgb255 253 174 97
                    , rgb255 255 255 191
                    , rgb255 171 217 233
                    , rgb255 44 123 182
                    ]

                4 ->
                    [ rgb255 215 25 28
                    , rgb255 253 174 97
                    , rgb255 171 221 164
                    , rgb255 43 131 186
                    ]

                3 ->
                    [ rgb255 252 141 89
                    , rgb255 255 255 191
                    , rgb255 153 213 148
                    ]

                _ ->
                    []

        _ ->
            []


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
