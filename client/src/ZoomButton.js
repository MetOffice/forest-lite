import React from "react"
import "./ZoomButton.css"


class ZoomButton extends React.Component {
    render() {
        return (
            <div className="zoom-button">
                <button class="tooltip">+<span class="tooltip-text">Zoom in</span></button>
                <button class="tooltip">-<span class="tooltip-text">Zoom out</span></button>
            </div>
        )
    }
}


export default ZoomButton
