module ColorSchemeSelectTests exposing (..)

import Api.Enum.Kind exposing (..)
import ColorScheme.Name exposing (..)
import ColorScheme.Select exposing (..)
import Expect exposing (Expectation)
import Test exposing (..)


colorSchemeSelectTests : Test
colorSchemeSelectTests =
    describe "ColorScheme.Select API"
        [ test "getKind" <|
            \_ ->
                notSelected
                    |> getKind
                    |> Expect.equal Nothing
        , test "setKind" <|
            \_ ->
                let
                    kind =
                        Diverging

                    rank =
                        Rank 3

                    name =
                        ColorScheme.Name.fromString "Spectral"
                in
                notSelected
                    |> setKind kind
                    |> setRank rank
                    |> setName name
                    |> getKind
                    |> Expect.equal (Just kind)
        , test "getName" <|
            \_ ->
                let
                    kind =
                        Diverging

                    rank =
                        Rank 3

                    name =
                        ColorScheme.Name.fromString "Spectral"
                in
                notSelected
                    |> setKind kind
                    |> setRank rank
                    |> setName name
                    |> getName
                    |> Expect.equal (Just name)
        ]
