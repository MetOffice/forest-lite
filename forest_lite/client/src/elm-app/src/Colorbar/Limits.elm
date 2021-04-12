module Colorbar.Limits exposing
    ( DataLimits(..)
    , LimitOrigin(..)
    , Limits
    , Model
    , Msg
    , init
    , update
    , view
    )

import Action exposing (Action(..))
import DataVar.Select exposing (Select)
import Html
    exposing
        ( Html
        , button
        , div
        , i
        , input
        , label
        , text
        )
import Html.Attributes exposing (attribute, checked, class, style, value)
import Html.Events exposing (onCheck, onClick, onInput)
import Ports


type Msg
    = CopyDataLimits Bound
    | LowerBound String
    | UpperBound String
    | SetLimitOrigin Bool


type alias Model a =
    { a
        | limits : Limits
        , selected : Maybe DataVar.Select.Select
    }


type alias Limits =
    { user_input : TextLimits
    , data_source : DataLimits
    , origin : LimitOrigin
    }


type Bound
    = Upper
    | Lower


type LimitOrigin
    = UserInput
    | DataSource


type TextLimits
    = TextLimits String String


type DataLimits
    = DataLimits Float Float
    | Undefined


init : Limits
init =
    { user_input = TextLimits "0" "1"
    , data_source = Undefined
    , origin = DataSource
    }


update : Msg -> Model a -> ( Model a, Cmd Msg )
update msg model =
    case msg of
        CopyDataLimits bound ->
            let
                user_input =
                    setBound bound model.limits.data_source model.limits.user_input

                cmds =
                    limitsCmd UserInput user_input model.selected
            in
            ( model
                |> setLimits
                    (model.limits
                        |> setUserInput user_input
                    )
            , cmds
            )

        SetLimitOrigin flag ->
            let
                model_limits =
                    model.limits
            in
            if flag then
                ( { model | limits = { model_limits | origin = DataSource } }
                , setLimitOriginCmd DataSource model.limits model.selected
                )

            else
                ( { model | limits = { model_limits | origin = UserInput } }
                , setLimitOriginCmd UserInput model.limits model.selected
                )

        LowerBound inputText ->
            case model.limits.user_input of
                TextLimits lower upper ->
                    let
                        origin =
                            model.limits.origin

                        user_input =
                            TextLimits inputText upper

                        cmds =
                            limitsCmd origin user_input model.selected

                        model_limits =
                            model.limits
                    in
                    ( { model
                        | limits =
                            { model_limits
                                | user_input =
                                    user_input
                            }
                      }
                    , cmds
                    )

        UpperBound inputText ->
            case model.limits.user_input of
                TextLimits lower upper ->
                    let
                        origin =
                            model.limits.origin

                        user_input =
                            TextLimits lower inputText

                        cmds =
                            limitsCmd origin user_input model.selected

                        model_limits =
                            model.limits
                    in
                    ( { model
                        | limits =
                            { model_limits
                                | user_input =
                                    user_input
                            }
                      }
                    , cmds
                    )


view : Limits -> Html Msg
view limits =
    case limits.origin of
        UserInput ->
            viewUserLimits limits.user_input

        DataSource ->
            viewSourceLimits limits.data_source


viewUserLimits : TextLimits -> Html Msg
viewUserLimits (TextLimits lower upper) =
    div []
        [ div [ class "Limits__input" ]
            [ label [ class "Limits__label" ] [ text "Low:" ]
            , input [ value lower, onInput LowerBound ] []
            , viewCopyDataButton (CopyDataLimits Lower)
            , viewBoundWarning lower
            ]
        , div [ class "Limits__input" ]
            [ label [ class "Limits__label" ] [ text "High:" ]
            , input [ value upper, onInput UpperBound ] []
            , viewCopyDataButton (CopyDataLimits Upper)
            , viewBoundWarning upper
            ]
        , viewLimitsWarning (TextLimits lower upper)
        , viewFollowCheckbox UserInput
        ]


viewSourceLimits : DataLimits -> Html Msg
viewSourceLimits limits =
    case limits of
        DataLimits lower upper ->
            div [ class "Limits__container" ]
                [ div [ class "Limits__label" ] [ text "Lower limit:" ]
                , div [] [ text (String.fromFloat lower) ]
                , div [ class "Limits__section" ]
                    [ div [ class "Limits__label" ]
                        [ text "Upper limit:"
                        ]
                    , div [] [ text (String.fromFloat upper) ]
                    ]
                , viewFollowCheckbox DataSource
                ]

        Undefined ->
            div [ class "Limits__container" ]
                [ div [] [ text "Data extent not available" ]
                ]


viewFollowCheckbox : LimitOrigin -> Html Msg
viewFollowCheckbox origin =
    let
        flag =
            origin == DataSource
    in
    label [ style "display" "block" ]
        [ input
            [ attribute "type" "checkbox"
            , checked flag
            , onCheck SetLimitOrigin
            ]
            []
        , text "Follow data limits"
        ]


viewLimitsWarning : TextLimits -> Html Msg
viewLimitsWarning limits =
    case toDataLimits limits of
        DataLimits lower upper ->
            if lower >= upper then
                div [ class "Limits__warning" ] [ text "high must be greater than low" ]

            else
                text ""

        Undefined ->
            text ""


viewBoundWarning : String -> Html Msg
viewBoundWarning bound =
    case String.toFloat bound of
        Just value ->
            text ""

        Nothing ->
            div [ class "Limits__warning" ] [ text "please enter a valid number" ]


viewCopyDataButton : Msg -> Html Msg
viewCopyDataButton tagger =
    button [ onClick tagger ]
        [ i [ class "far fa-chart-bar" ] []
        ]


toDataLimits : TextLimits -> DataLimits
toDataLimits (TextLimits lowerText upperText) =
    let
        maybeLower =
            String.toFloat lowerText

        maybeUpper =
            String.toFloat upperText
    in
    case ( maybeLower, maybeUpper ) of
        ( Just lower, Just upper ) ->
            DataLimits lower upper

        _ ->
            Undefined


setUserInput : TextLimits -> Limits -> Limits
setUserInput user_input limits =
    { limits | user_input = user_input }


setBound : Bound -> DataLimits -> TextLimits -> TextLimits
setBound bound data_limits (TextLimits user_low user_high) =
    let
        data_input =
            toUserInput data_limits
    in
    case data_input of
        TextLimits data_low data_high ->
            case bound of
                Upper ->
                    TextLimits user_low data_high

                Lower ->
                    TextLimits data_low user_high


limitsCmd : LimitOrigin -> TextLimits -> Maybe DataVar.Select.Select -> Cmd Msg
limitsCmd origin text_limits maybe_select_data_var =
    case origin of
        DataSource ->
            Cmd.none

        UserInput ->
            case toDataLimits text_limits of
                Undefined ->
                    Cmd.none

                DataLimits lower upper ->
                    case maybe_select_data_var of
                        Nothing ->
                            Cmd.none

                        Just selected ->
                            SetLimits lower upper selected.dataset_id selected.data_var
                                |> Action.encode
                                |> Ports.sendAction


setLimitOriginCmd : LimitOrigin -> Limits -> Maybe DataVar.Select.Select -> Cmd Msg
setLimitOriginCmd origin limits maybe_select_data_var =
    case origin of
        DataSource ->
            case limits.data_source of
                Undefined ->
                    Cmd.none

                DataLimits lower upper ->
                    case maybe_select_data_var of
                        Nothing ->
                            Cmd.none

                        Just selected ->
                            SetLimits lower upper selected.dataset_id selected.data_var
                                |> Action.encode
                                |> Ports.sendAction

        UserInput ->
            case toDataLimits limits.user_input of
                Undefined ->
                    Cmd.none

                DataLimits lower upper ->
                    case maybe_select_data_var of
                        Nothing ->
                            Cmd.none

                        Just selected ->
                            SetLimits lower upper selected.dataset_id selected.data_var
                                |> Action.encode
                                |> Ports.sendAction


setLimits : Limits -> Model a -> Model a
setLimits limits model =
    { model | limits = limits }


toUserInput : DataLimits -> TextLimits
toUserInput data_source =
    case data_source of
        Undefined ->
            TextLimits "0" "1"

        DataLimits low high ->
            TextLimits (String.fromFloat low) (String.fromFloat high)
