import React from "react"
import { connect } from "react-redux"
import Toggle from "./Toggle.js"
import { toggleFlag } from "./actions"


class HoverToolToggle extends React.Component {
    render() {
        const { active, dispatch } = this.props
        const icon = "far fa-comment-alt"
        const onClick = () => dispatch(toggleFlag("hover_tool", true))
        return (
            <Toggle icon={ icon }
                    active={ active }
                    onClick={ onClick } />
        )
    }
}


const mapStateToProps = state => {
    const { hover_tool: active = true } = state
    return { active }
}


export default connect(mapStateToProps)(HoverToolToggle)
