module Main exposing (..)

import Browser
import Html exposing (Html, div, h1, li, span, text, ul)
import Html.Attributes exposing (class, style)


type alias JWTClaim =
    { auth_time : Int
    , email : String
    , name : String
    , given_name : String
    , family_name : String
    , groups : List String
    , iat : Int
    , exp : Int
    }


type alias User =
    { name : String
    , email : String
    , groups : List String
    }


type alias Model =
    { user : User }


type Msg
    = Name String



-- MAIN


main : Program JWTClaim Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- INIT


init : JWTClaim -> ( Model, Cmd Msg )
init claim =
    ( { user =
            { name = claim.name
            , email = claim.email
            , groups = claim.groups
            }
      }
    , Cmd.none
    )



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update _ model =
    ( model, Cmd.none )



-- VIEW


view : Model -> Html Msg
view model =
    div
        [ style "display" "grid"
        , style "grid-template-columns" "1fr 1fr 1fr"
        ]
        [ div [ style "grid-column-start" "2" ]
            [ div [ class "Account__card" ]
                [ viewTitle
                , viewUser model.user
                ]
            ]
        ]


viewTitle : Html Msg
viewTitle =
    h1
        [ class "Account__h1" ]
        [ text "Account information" ]


viewUser : User -> Html Msg
viewUser user =
    div
        []
        [ viewItem "Name" user.name
        , viewItem "Contact" user.email
        , div
            [ class "Account__item__container" ]
            [ div [ class "Account__item__label" ]
                [ text "Authentication groups"
                ]
            , div []
                [ ul
                    [ class "Account__ul" ]
                    (List.map viewGroup user.groups)
                ]
            ]
        ]


viewGroup group =
    li
        [ class "Account__li" ]
        [ text group ]


viewItem : String -> String -> Html Msg
viewItem label content =
    div
        [ class "Account__item__container" ]
        [ div
            [ class "Account__item__label" ]
            [ text label ]
        , div
            [ class "Account__item__content" ]
            [ text content ]
        ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none
