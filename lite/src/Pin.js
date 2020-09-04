import React from "react"
import { TapTool } from "@bokeh/bokehjs/build/js/lib/models"


class Pin extends React.Component {
    constructor(props) {
        super(props)

        // Register Tap event
        props.figure.js_event_callbacks = {
            "tap": [ { execute: this.onTap } ]
        }
    }
    onTap({ x, y }) {
        console.log({ x, y })
    }
    render() {
        return null
    }
}


export default Pin
