module ColorbrewerTests exposing (..)

import Colorbrewer exposing (rgb255)
import Expect
import Test exposing (..)


colorbrewerTests : Test
colorbrewerTests =
    describe "toColors"
        [ test "Spectral 3" <|
            \_ ->
                Colorbrewer.toColors (Colorbrewer.spectral 3)
                    |> Expect.equal
                        [ rgb255 252 141 89
                        , rgb255 255 255 191
                        , rgb255 153 213 148
                        ]
        , test "Spectral 4" <|
            \_ ->
                Colorbrewer.toColors (Colorbrewer.spectral 4)
                    |> Expect.equal
                        [ rgb255 215 25 28
                        , rgb255 253 174 97
                        , rgb255 171 221 164
                        , rgb255 43 131 186
                        ]
        , test "Spectral 5" <|
            \_ ->
                Colorbrewer.toColors (Colorbrewer.spectral 5)
                    |> Expect.equal
                        [ rgb255 215 25 28
                        , rgb255 253 174 97
                        , rgb255 255 255 191
                        , rgb255 171 217 233
                        , rgb255 44 123 182
                        ]
        , test "Spectral 6" <|
            \_ ->
                Colorbrewer.toColors (Colorbrewer.spectral 6)
                    |> List.map Colorbrewer.toRGB
                    |> Expect.equal
                        [ "rgb(213,62,79)"
                        , "rgb(252,141,89)"
                        , "rgb(254,224,139)"
                        , "rgb(230,245,152)"
                        , "rgb(153,213,148)"
                        , "rgb(50,136,189)"
                        ]
        ]


toHexTests : Test
toHexTests =
    describe "toHex"
        [ test "white" <|
            \_ ->
                Colorbrewer.toHex (rgb255 0 0 0)
                    |> Expect.equal
                        "#000000"
        , test "blue" <|
            \_ ->
                Colorbrewer.toHex (rgb255 0 0 255)
                    |> Expect.equal
                        "#0000FF"
        , test "green" <|
            \_ ->
                Colorbrewer.toHex (rgb255 0 255 0)
                    |> Expect.equal
                        "#00FF00"
        , test "red" <|
            \_ ->
                Colorbrewer.toHex (rgb255 255 0 0)
                    |> Expect.equal
                        "#FF0000"
        ]
