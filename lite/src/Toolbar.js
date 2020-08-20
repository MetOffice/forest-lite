import React from "react"
import { connect } from "react-redux"
import Toggle from "./Toggle.js"
import { toggleHoverTool, toggleColorbar } from "./actions"


class Toolbar extends React.Component {
    render() {
        return (
            <div>
                <Toggle icon="far fa-comment-alt"
                        active={ this.props.hover_tool }
                        onClick={ () => { this.handleClick("hovertool") } } />
                <Toggle icon="fas fa-palette"
                        active={ this.props.colorbar }
                        onClick={ () => { this.handleClick("colorbar") } } />
            </div>
        )
    }

    handleClick(icon) {
        if (icon === "hovertool") {
            this.props.dispatch(toggleHoverTool())
        } else {
            this.props.dispatch(toggleColorbar())
        }
    }
}


const mapStateToProps = (state) => {
    let { hover_tool, colorbar } = state
    if (typeof hover_tool === "undefined") {
        hover_tool = false
    }
    if (typeof colorbar === "undefined") {
        colorbar = false
    }
    return { hover_tool, colorbar }
}


export default connect(mapStateToProps)(Toolbar)
