module ColorSchemeRequest exposing (..)

{-| Request color scheme information from GraphQL endpoint
-}

import Api.Enum.Kind
import Api.Object exposing (ColorScheme)
import Api.Object.ColorScheme
import Api.Object.Palette
import Api.Query
import Graphql.Http
import Graphql.Operation exposing (RootQuery)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet exposing (SelectionSet)


{-| Subset of ColorScheme GraphQL endpoint type
-}
type alias ColorScheme =
    { name : String
    , kind : Maybe Api.Enum.Kind.Kind
    , palettes : List Palette
    }


{-| Subset of Palette GraphQL endpoint type
-}
type alias Palette =
    { rank : Int
    , rgbs : List String
    }


query : SelectionSet (List ColorScheme) RootQuery
query =
    Api.Query.colorSchemes identity colorSchemeSelection


queryByRank : Int -> SelectionSet (List ColorScheme) RootQuery
queryByRank rank =
    let
        arguments =
            \optionals ->
                { optionals
                    | rank = Present rank
                }
    in
    Api.Query.colorSchemes arguments colorSchemeSelection


colorSchemeSelection : SelectionSet ColorScheme Api.Object.ColorScheme
colorSchemeSelection =
    Graphql.SelectionSet.map3 ColorScheme
        Api.Object.ColorScheme.name
        Api.Object.ColorScheme.kind
        (Api.Object.ColorScheme.palettes identity paletteSelection)


paletteSelection : SelectionSet Palette Api.Object.Palette
paletteSelection =
    Graphql.SelectionSet.map2 Palette
        Api.Object.Palette.rank
        Api.Object.Palette.rgbs
