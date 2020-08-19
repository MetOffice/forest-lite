import React from "react"
import { connect } from "react-redux"
import { toggleHoverTool } from "./actions"


class ConnectedToggle extends React.Component {
    render() {
        console.log(this.props)
        return (
            <i className="fa-play fas" onClick={ () => this.handleClick() }></i>
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


const Toggle = connect(mapStateToProps)(ConnectedToggle)


class App extends React.Component {
    render() {
        return <Toggle></Toggle>
    }
}


export default App
