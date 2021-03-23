import React from "react"
import { useSelector } from "react-redux"
import TiledImage, { DatasetDescription } from "./TiledImage.js"
import RDT from "./RDT.js"
import { map } from "ramda"


const selectDatasets = ({ datasets=[] }) => datasets


const TileRenderer = ({ baseURL, datasetId, label, figure  }) => {
    return (
        <>
            <DatasetDescription
                baseURL={ baseURL }
                datasetId={ datasetId } />
            <TiledImage
                datasetId={ datasetId }
                baseURL={ baseURL }
                figure={ figure } />
        </>
    )
}

const Layers = ({ baseURL, figure }) => {
    const datasets = useSelector(selectDatasets)
    const makeComponents = map(
        dataset => {
            const { label, view, id } = dataset
            if (view === "tiled_image") {
                return <TileRenderer
                            key={ label }
                            label={ label }
                            datasetId={ id }
                            baseURL={ baseURL }
                            figure={ figure } />
            } else if (view === "rdt") {
                return <RDT
                            key={ label }
                            baseURL={ baseURL }
                            figure={ figure } />
            } else {
                return null
            }
        }
    )
    return (<>
        { makeComponents(datasets) }
    </>)
}


export default Layers
