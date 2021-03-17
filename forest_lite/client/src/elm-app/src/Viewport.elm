module Viewport exposing (..)


type Viewport a
    = Viewport a a


map : (a -> b) -> Viewport a -> Viewport b
map f (Viewport start end) =
    Viewport (f start) (f end)


getStart : Viewport a -> a
getStart (Viewport start _) =
    start


getEnd : Viewport a -> a
getEnd (Viewport _ end) =
    end
