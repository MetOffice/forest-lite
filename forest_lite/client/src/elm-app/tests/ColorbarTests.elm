module ColorbarTests exposing (..)

import Api.Enum.Kind exposing (Kind(..))
import ColorScheme.Name
import ColorScheme.Order exposing (leftToRight, rightToLeft)
import ColorScheme.Rank
import ColorScheme.Select exposing (notSelected)
import Colorbar.Menu exposing (Msg(..))
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
                        , colorSchemeSelected = notSelected
                        , colorSchemes = Loading
                        , colorSchemeKind = Nothing
                        , colorSchemeRanks = []
                        , colorSchemeRank = Nothing
                        , colorSchemeOrder = leftToRight
                        }

                    msg =
                        SetOrder rightToLeft
                in
                Colorbar.Menu.update msg model
                    |> Tuple.first
                    |> Expect.equal
                        { model | colorSchemeOrder = rightToLeft }
        , test "parseScheme" <|
            \_ ->
                Colorbar.Menu.parseScheme
                    [ { name = "Name"
                      , kind = Just Diverging
                      , palettes =
                            [ { rank = 1, rgbs = [ "rgb(0,0,0)" ] }
                            , { rank = 2, rgbs = [ "rgb(1,1,1)" ] }
                            ]
                      }
                    ]
                    (ColorScheme.Name.fromString "Name")
                    (ColorScheme.Rank.fromInt 1)
                    |> Expect.equal
                        (Just
                            { name = "Name"
                            , colors =
                                [ "rgb(0,0,0)" ]
                            }
                        )
        ]
