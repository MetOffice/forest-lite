import React from "react"
import { connect } from "react-redux"
import TiledImage from "./TiledImage.js"
import RDT from "./RDT.js"
import { set_times, set_time_index } from "./actions.js"


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
        return (<>
            <TiledImage
                 baseURL={ this.props.baseURL }
                 figure={ this.props.figure }
                 color_mapper={ this.props.color_mapper } />
        </>)
    }
}

const mapStateToProps = state => ({})

export default connect(mapStateToProps)(Layers)
