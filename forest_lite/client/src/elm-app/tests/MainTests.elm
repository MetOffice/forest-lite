module MainTests exposing (..)

import Expect
import Main
import Test exposing (..)


mainTests : Test
mainTests =
    test "import Main.elm" <|
        \_ ->
            True
                |> Expect.equal True
