import React from "react"
import { connect } from "react-redux"
import Toggle from "./Toggle.js"
import { toggleHoverTool } from "./actions"


class Toolbar extends React.Component {
    render() {
        return (
            <div>
                <Toggle icon="far fa-comment-alt"
                        active={ this.props.flag }
                        onClick={ () => { this.handleClick("hovertool") } } />
                <Toggle icon="fas fa-palette"
                        active={ true }
                        onClick={ () => { this.handleClick("palette") } } />
            </div>
        )
    }

    handleClick(icon) {
        if (icon === "hovertool") {
            this.props.dispatch(toggleHoverTool())
        } else {
            console.log("Click", icon)
        }
    }
}


const mapStateToProps = (state) => {
    if (typeof state.hover_tool === "undefined") {
        return {flag: false}
    }
    return {flag: state.hover_tool}
}


export default connect(mapStateToProps)(Toolbar)
