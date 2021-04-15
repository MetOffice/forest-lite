module ColorbrewerTests exposing (..)

import Colorbrewer exposing (rgb255)
import Expect
import Test exposing (..)


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
