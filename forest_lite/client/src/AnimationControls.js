import React from "react"
import { connect } from "react-redux"
import {
    set_playing,
    next_time_index,
    previous_time_index,
} from "./actions.js"
import "./AnimationControls.css"


// Play button
class _Play extends React.Component {
    render() {
        const { dispatch, playing } = this.props

        // Curry onClick handler
        const onClick = dispatch => () => {
            // Toggle play mode
            dispatch(set_playing(!playing))
        }

        // Set font-awesome icon
        let className
        if (playing) {
            className = "fas fa-pause"
        } else {
            className = "fas fa-play"
        }
        return (
            <button onClick={ onClick(dispatch) } className="lite-btn play-btn">
                <i className={ className }></i>
            </button>
        )
    }
}
const Play = connect(state => {
    const { playing = false } = state
    return { playing }
})(_Play)


// Previous button
class _Previous extends React.Component {
    render() {
        const { dispatch } = this.props
        const onClick = dispatch => () => {
            dispatch(previous_time_index())
        }
        return (
            <button onClick={ onClick(dispatch) } className="lite-btn previous-btn">
                <i className="fas fa-angle-left"></i>
            </button>
        )
    }
}
const Previous = connect(state => ({}))(_Previous)


// Next button
class _Next extends React.Component {
    render() {
        const { dispatch } = this.props
        const onClick = dispatch => () => {
            dispatch(next_time_index())
        }
        return (
            <button onClick={ onClick(dispatch) } className="lite-btn next-btn">
                <i className="fas fa-angle-right"></i>
            </button>
        )
    }
}
const Next = connect(state => ({}))(_Next)

class AnimationControls extends React.Component {
    render() {
        return (
            <div className="animation-container btn-row">
                <Previous />
                <Play />
                <Next />
            </div>
        )
    }
}


export default AnimationControls
