import React from "react"
import { connect } from "react-redux"
import Toggle from "./Toggle.js"
import { toggleFlag } from "./actions"
import * as R from "ramda"


class StateToggle extends React.Component {
    render() {
        const { onClick, active, icon } = this.props
        return (
            <Toggle icon={ icon }
                    active={ active }
                    onClick={ onClick } />
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    const active = R.propOr(false, ownProps.attr)(state)
    return { active }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onClick: () => dispatch(toggleFlag(ownProps.attr))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StateToggle)
