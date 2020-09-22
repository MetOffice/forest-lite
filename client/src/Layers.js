import React from "react"
import { connect } from "react-redux"
import TiledImage from "./TiledImage.js"
import RDT from "./RDT.js"
import { set_times, set_time_index } from "./actions.js"
import * as R from "ramda"


class Layers extends React.Component {
    componentDidMount() {
        // Initial times
        const { dispatch, baseURL } = this.props
        dispatch(set_time_index(0))
        fetch(`${baseURL}/datasets/EIDA50/times?limit=3`)
            .then((response) => response.json())
            .then((data) => {
                let action = set_times(data)
                dispatch(action)
            })
    }
    render() {
        const { datasets } = this.props
        if (typeof datasets === "undefined") return null
        const { baseURL, figure, color_mapper } = this.props
        const makeComponents = R.map(
            dataset => {
                const { label } = dataset
                if (label === "EIDA50") {
                    return <TiledImage
                                key={ label }
                                baseURL={ baseURL }
                                figure={ figure }
                                color_mapper={ color_mapper } />
                } else if (label === "RDT") {
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
