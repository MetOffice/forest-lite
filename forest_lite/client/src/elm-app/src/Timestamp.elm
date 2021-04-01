module Timestamp exposing (format)

import Time


format : Int -> String
format millis =
    let
        posix =
            Time.millisToPosix millis

        year =
            String.fromInt (Time.toYear Time.utc posix)

        month =
            formatMonth (Time.toMonth Time.utc posix)

        day =
            String.fromInt (Time.toDay Time.utc posix)

        hour =
            String.padLeft 2 '0' (String.fromInt (Time.toHour Time.utc posix))

        minute =
            String.padLeft 2 '0' (String.fromInt (Time.toMinute Time.utc posix))

        date =
            String.join " " [ year, month, day ]

        time =
            String.join ":" [ hour, minute ]

        zone =
            "UTC"
    in
    String.join " " [ date, time, zone ]


formatMonth : Time.Month -> String
formatMonth month =
    case month of
        Time.Jan ->
            "January"

        Time.Feb ->
            "February"

        Time.Mar ->
            "March"

        Time.Apr ->
            "April"

        Time.May ->
            "May"

        Time.Jun ->
            "June"

        Time.Jul ->
            "July"

        Time.Aug ->
            "August"

        Time.Sep ->
            "September"

        Time.Oct ->
            "October"

        Time.Nov ->
            "November"

        Time.Dec ->
            "December"
