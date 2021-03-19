module Dataset exposing (Dataset, decoder, view)

import DataVar.Select exposing (Select)
import DataVarLabel exposing (DataVarLabel)
import Dataset.Description exposing (Description)
import Dataset.ID exposing (ID)
import Dataset.Label exposing (Label)
import Dict exposing (Dict)
import Html
    exposing
        ( Html
        , optgroup
        , option
        , text
        )
import Html.Attributes
    exposing
        ( attribute
        )
import Json.Decode exposing (Decoder, field, string)
import Request exposing (Request(..))


type alias Dataset =
    { label : Dataset.Label.Label
    , id : Dataset.ID.ID
    , driver : String
    , view : String
    }


decoder : Decoder Dataset
decoder =
    Json.Decode.map4 Dataset
        (field "label" Dataset.Label.decoder)
        (field "id" Dataset.ID.decoder)
        (field "driver" string)
        (field "view" string)


view : Dict Int (Request Dataset.Description.Description) -> Dataset -> Html msg
view datasetDescriptions dataset =
    let
        dataset_label =
            Dataset.Label.toString dataset.label

        maybeDescription =
            Dict.get (Dataset.ID.toInt dataset.id) datasetDescriptions
    in
    case maybeDescription of
        Just description ->
            case description of
                Success desc ->
                    optgroup [ attribute "label" dataset_label ]
                        (List.map
                            (\v ->
                                option
                                    [ attribute "value"
                                        (DataVar.Select.toString
                                            { data_var = DataVarLabel.DataVarLabel v
                                            , dataset_id = dataset.id
                                            }
                                        )
                                    ]
                                    [ text v ]
                            )
                            (Dict.keys desc.data_vars)
                        )

                Failure ->
                    optgroup [ attribute "label" dataset_label ]
                        [ option [] [ text "Failed to load variables" ]
                        ]

                Loading ->
                    optgroup [ attribute "label" dataset_label ]
                        [ option [] [ text "..." ]
                        ]

                NotStarted ->
                    optgroup [ attribute "label" dataset_label ]
                        [ option [] [ text "..." ]
                        ]

        Nothing ->
            optgroup [ attribute "label" dataset_label ] []
