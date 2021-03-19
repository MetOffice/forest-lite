module Request exposing (Request(..))


type Request a
    = NotStarted
    | Failure
    | Loading
    | Success a
