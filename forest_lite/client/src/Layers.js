import React from "react"
import { connect } from "react-redux"
import TiledImage, { InitialTimes, DatasetDescription } from "./TiledImage.js"
import RDT from "./RDT.js"
import * as R from "ramda"


const TileRenderer = ({ baseURL, datasetId, label, figure  }) => {
    return (
        <>
            <InitialTimes
                baseURL={ baseURL }
                datasetId={ datasetId }
                label={ label } />
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

class Layers extends React.Component {
    render() {
        const { datasets } = this.props
        if (typeof datasets === "undefined") return null
        const { baseURL, figure } = this.props
        const makeComponents = R.addIndex(R.map)(
            (dataset, datasetId) => {
                const { label, view } = dataset
                if (view === "tiled_image") {
                    return <TileRenderer
                                key={ label }
                                label={ label }
                                datasetId={ datasetId }
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
}


const mapStateToProps = state => {
    const { datasets } = state
    return { datasets }
}


export default connect(mapStateToProps)(Layers)
