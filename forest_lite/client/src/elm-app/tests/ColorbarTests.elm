module ColorbarTests exposing (..)

import Colorbar.Menu exposing (Msg(..), Order(..))
import Expect exposing (Expectation)
import Request exposing (Request(..))
import Test exposing (..)


colorbarTests : Test
colorbarTests =
    test "update" <|
        \_ ->
            let
                model =
                    { baseURL = ""
                    , colorSchemes = Loading
                    , colorSchemeKind = Nothing
                    , colorSchemeRanks = []
                    , colorSchemeRank = Nothing
                    , colorSchemeName = Nothing
                    , colorSchemeOrder = LeftToRight
                    }

                msg =
                    SetOrder RightToLeft
            in
            Colorbar.Menu.update msg model
                |> Expect.equal
                    ( { model | colorSchemeOrder = RightToLeft }
                    , Cmd.none
                    )
