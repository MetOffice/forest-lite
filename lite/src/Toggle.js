import React from "react"
import { connect } from "react-redux"
import { toggleHoverTool } from "./actions"


class Toggle extends React.Component {
    render() {
        let spanStyle
        let iconStyle
        if (this.props.flag) {
            spanStyle = {
            }
            iconStyle = {
            }
        } else {
            spanStyle = {
                backgroundColor: "#EEE"
            }
            iconStyle = {
                color: "#BBB"
            }
        }
        return (
            <span className="tool-icon fa-stack fa-1x" style={ spanStyle } onClick={ () => this.handleClick() }>
                <i className="far fa-comment-alt fa-stack-1x" style={ iconStyle }></i>
            </span>
        )
    }

    handleClick() {
        this.props.dispatch(toggleHoverTool())
    }
}


const mapStateToProps = (state) => {
    if (typeof state.hover_tool === "undefined") {
        return {flag: false}
    }
    return {flag: state.hover_tool}
}


export default connect(mapStateToProps)(Toggle)
