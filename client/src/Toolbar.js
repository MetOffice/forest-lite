import React from "react"
import { connect } from "react-redux"
import Toggle from "./Toggle.js"
import { toggleFlag } from "./actions"


class Toolbar extends React.Component {
    render() {
        return (
            <div>
                <Toggle icon="far fa-comment-alt"
                        active={ this.props.hover_tool }
                        onClick={ () => { this.handleClick("hover_tool") } } />
                <Toggle icon="fas fa-palette"
                        active={ this.props.colorbar }
                        onClick={ () => { this.handleClick("colorbar") } } />
                <Toggle icon="fas fa-layer-group"
                        active={ this.props.layers }
                        onClick={ () => { this.handleClick("layers") } } />
            </div>
        )
    }

    handleClick(prop) {
        this.props.dispatch(toggleFlag(prop))
    }
}


const mapStateToProps = (state) => {
    let {
        hover_tool = false,
        colorbar = false,
        contours = false,
        layers = false
    } = state
    return { hover_tool, colorbar, contours, layers }
}


export default connect(mapStateToProps)(Toolbar)
