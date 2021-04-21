module ActionTests exposing (..)

import Action exposing (Action(..))
import Expect exposing (Expectation)
import Json.Encode exposing (encode, int, list, object, string)
import Test exposing (..)


actionTests : Test
actionTests =
    describe "encode"
        [ test "SetFigure" <|
            \_ ->
                let
                    action =
                        SetFigure 0 1 2 3

                    expect =
                        encode 0
                            (object
                                [ ( "type", string "SET_FIGURE" )
                                , ( "payload"
                                  , object
                                        [ ( "x_range"
                                          , object
                                                [ ( "start", int 0 )
                                                , ( "end", int 1 )
                                                ]
                                          )
                                        , ( "y_range"
                                          , object
                                                [ ( "start", int 2 )
                                                , ( "end", int 3 )
                                                ]
                                          )
                                        ]
                                  )
                                ]
                            )
                in
                Action.encode action
                    |> Expect.equal expect
        , test "SetColors" <|
            \_ ->
                let
                    colors =
                        [ "#FFFFFF" ]

                    action =
                        SetColors colors

                    expect =
                        encode 0
                            (object
                                [ ( "type", string "SET_COLORS" )
                                , ( "payload", list string colors )
                                ]
                            )
                in
                Action.encode action |> Expect.equal expect
        ]
