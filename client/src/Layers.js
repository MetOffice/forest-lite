import React from "react"
import { connect } from "react-redux"
import TiledImage from "./TiledImage.js"
import RDT from "./RDT.js"
import * as R from "ramda"


class Layers extends React.Component {
    render() {
        const { datasets } = this.props
        if (typeof datasets === "undefined") return null
        const { baseURL, figure, color_mapper } = this.props
        const makeComponents = R.addIndex(R.map)(
            (dataset, datasetId) => {
                const { label, driver } = dataset
                if (driver === "eida50") {
                    return <TiledImage
                                key={ label }
                                label={ label }
                                datasetId={ datasetId }
                                baseURL={ baseURL }
                                figure={ figure }
                                color_mapper={ color_mapper } />
                } else if (driver === "rdt") {
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
