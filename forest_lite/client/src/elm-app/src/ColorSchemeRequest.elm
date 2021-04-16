module ColorSchemeRequest exposing (..)

{-| Request color scheme information from GraphQL endpoint
-}

import Api.Enum.Kind
import Api.Object exposing (ColorScheme)
import Api.Object.ColorScheme
import Api.Query as Query
import Graphql.Http
import Graphql.Operation exposing (RootQuery)
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet)


{-| Subset of ColorScheme GraphQL endpoint type
-}
type alias ColorScheme =
    { name : String
    , kind : Maybe Api.Enum.Kind.Kind
    }


query : SelectionSet (List ColorScheme) RootQuery
query =
    Query.colorSchemes identity colorSchemeSelection


colorSchemeSelection : SelectionSet ColorScheme Api.Object.ColorScheme
colorSchemeSelection =
    SelectionSet.map2 ColorScheme
        Api.Object.ColorScheme.name
        Api.Object.ColorScheme.kind
