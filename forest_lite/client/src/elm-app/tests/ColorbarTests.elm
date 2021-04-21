module ColorbarTests exposing (..)

import Colorbar.Menu exposing (Msg(..), Order(..))
import Expect exposing (Expectation)
import Request exposing (Request(..))
import Test exposing (..)


colorbarTests : Test
colorbarTests =
    describe "Colorbar.Menu"
        [ test "update model" <|
            \_ ->
                let
                    model =
                        { baseURL = ""
                        , colorScheme = Nothing
                        , colorSchemes = Loading
                        , colorSchemeKind = Nothing
                        , colorSchemeRanks = []
                        , colorSchemeRank = Nothing
                        , colorSchemeOrder = LeftToRight
                        }

                    msg =
                        SetOrder RightToLeft
                in
                Colorbar.Menu.update msg model
                    |> Tuple.first
                    |> Expect.equal
                        { model | colorSchemeOrder = RightToLeft }
        , test "update given SetColorScheme" <|
            \_ ->
                let
                    model =
                        { baseURL = ""
                        , colorScheme = Nothing
                        , colorSchemes = Loading
                        , colorSchemeKind = Nothing
                        , colorSchemeRanks = []
                        , colorSchemeRank = Nothing
                        , colorSchemeOrder = LeftToRight
                        }

                    scheme =
                        { name = "Hello, World!", colors = [] }

                    msg =
                        SetColorScheme (Ok scheme)
                in
                Colorbar.Menu.update msg model
                    |> Tuple.first
                    |> Expect.equal
                        { model
                            | colorScheme = Just scheme
                        }
        ]
