import React from "react"
import { connect } from "react-redux"
import { zoomIn, zoomOut } from "./actions.js"
import "./ZoomButton.css"


class ZoomButton extends React.Component {
    render() {
        const { dispatch } = this.props
        const onClicks = {
            ZoomIn: () => { dispatch(zoomIn()) },
            ZoomOut: () => { dispatch(zoomOut()) }
        }
        return (
            <div className="zoom-button">
                <button
                    onClick={ onClicks.ZoomIn }
                    className="tooltip">+<span className="tooltip-text tooltip-text--left">Zoom in</span></button>
                <button
                    onClick={ onClicks.ZoomOut }
                    className="tooltip">-<span className="tooltip-text tooltip-text--left">Zoom out</span></button>
            </div>
        )
    }
}


const mapStateToProps = state => ({})


export default connect(mapStateToProps)(ZoomButton)
