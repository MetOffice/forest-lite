import React from "react"
import { connect } from "react-redux"
import Toggle from "./Toggle.js"
import { toggleFlag } from "./actions"


class Toolbar extends React.Component {
    render() {
        const style = {
            margin: "20px",
            padding: "4px"
        }
        return (
            <div className="menu abs-top right" style={ style }>
                <Toggle icon="far fa-comment-alt"
                        active={ this.props.hover_tool }
                        onClick={ () => { this.handleClick("hover_tool") } } />
                <Toggle icon="fas fa-palette"
                        active={ this.props.colorbar }
                        onClick={ () => { this.handleClick("colorbar") } } />
                <Toggle icon="far fa-circle"
                        active={ this.props.contours }
                        onClick={ () => { this.handleClick("contours") } } />
            </div>
        )
    }

    handleClick(prop) {
        this.props.dispatch(toggleFlag(prop))
    }
}


const mapStateToProps = (state) => {
    let { hover_tool, colorbar, contours } = state
    if (typeof hover_tool === "undefined") {
        hover_tool = false
    }
    if (typeof colorbar === "undefined") {
        colorbar = false
    }
    if (typeof contours === "undefined") {
        contours = false
    }
    return { hover_tool, colorbar, contours }
}


export default connect(mapStateToProps)(Toolbar)
