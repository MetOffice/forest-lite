module ColorScheme.Select exposing
    ( Selected
    , getKind
    , getName
    , getRank
    , notSelected
    , setKind
    , setName
    , setRank
    , toString
    )

import Api.Enum.Kind exposing (Kind)
import ColorScheme.Name exposing (Name)
import ColorScheme.Rank exposing (Rank)


type Selected
    = Not
    | HasKind Kind
    | HasKindRank Kind Rank
    | HasKindRankName Kind Rank Name



-- CONSTRUCTORS


notSelected : Selected
notSelected =
    Not



-- HELPERS


toString : Selected -> String
toString selected =
    case selected of
        Not ->
            "Not"

        HasKind kind ->
            "Has kind"

        HasKindRank kind rank ->
            "Has kind + rank"

        HasKindRankName kind rank name ->
            "Has kind + rank + name"



-- KIND


getKind : Selected -> Maybe Kind
getKind selected =
    case selected of
        Not ->
            Nothing

        HasKind kind ->
            Just kind

        HasKindRank kind _ ->
            Just kind

        HasKindRankName kind _ _ ->
            Just kind


setKind : Kind -> Selected -> Selected
setKind kind selected =
    case selected of
        Not ->
            HasKind kind

        HasKind _ ->
            HasKind kind

        HasKindRank _ rank ->
            HasKindRank kind rank

        HasKindRankName _ rank name ->
            HasKindRankName kind rank name



-- RANK


getRank : Selected -> Maybe Rank
getRank selected =
    case selected of
        Not ->
            Nothing

        HasKind _ ->
            Nothing

        HasKindRank _ rank ->
            Just rank

        HasKindRankName _ rank _ ->
            Just rank


setRank : Rank -> Selected -> Selected
setRank rank selected =
    case selected of
        Not ->
            Not

        HasKind kind ->
            HasKindRank kind rank

        HasKindRank kind _ ->
            HasKindRank kind rank

        HasKindRankName kind _ name ->
            HasKindRankName kind rank name



-- NAME


getName : Selected -> Maybe Name
getName selected =
    case selected of
        Not ->
            Nothing

        HasKind _ ->
            Nothing

        HasKindRank _ _ ->
            Nothing

        HasKindRankName _ _ name ->
            Just name


setName : Name -> Selected -> Selected
setName name selected =
    case selected of
        Not ->
            Not

        HasKind kind ->
            HasKind kind

        HasKindRank kind rank ->
            HasKindRankName kind rank name

        HasKindRankName kind rank _ ->
            HasKindRankName kind rank name
