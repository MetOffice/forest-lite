import React from "react"
import { connect } from "react-redux"
import { setState } from "./actions.js"


// Re-hydrate app from browser localStorage
class LocalStorage extends React.Component {
    constructor(props) {
        super(props)
        const { dispatch } = props
        const stateText = localStorage.getItem("key") || ""
        if (stateText !== "") {
            const state = JSON.parse(stateText)
            dispatch(setState(state))
        }
    }
    render() {
        const { state } = this.props
        if (typeof state === "undefined") return null
        localStorage.setItem("key", JSON.stringify(state))
        return null
    }
}


const mapStateToProps = state => ({ state })


export default connect(mapStateToProps)(LocalStorage)
