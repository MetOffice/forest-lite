import React from "react"
import { connect } from "react-redux"
import Toggle from "./Toggle.js"
import { toggleFlag } from "./actions"


class ColorbarToggle extends React.Component {
    render() {
        const { active, dispatch } = this.props
        const icon = "fas fa-palette"
        const onClick = () => dispatch(toggleFlag("colorbar", true))
        return (
            <Toggle icon={ icon }
                    active={ active }
                    onClick={ onClick } />
        )
    }
}


const mapStateToProps = state => {
    const { colorbar: active = true } = state
    return { active }
}


export default connect(mapStateToProps)(ColorbarToggle)
