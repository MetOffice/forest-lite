import React, { useState } from "react"
import { ToggleButton } from "../buttons"


const ColorbarSettings = () => {
    const [ mode, setMode ] = useState("Auto")
    const onChange = value => {
        setMode(value)
    }

    const manualStyle = {
        width: "100%",
        marginTop: "0.5em",
        color: "#333",
        lineHeight: "2em"
    }
    const inputStyle = {
        width: "100%",
        boxSizing: "border-box"
    }
    const labelStyle = {
        display: "block"
    }
    let manualEls = null
    if (mode === "Manual") {
        manualEls = (<div style={ manualStyle } >
            <div>
                <label style={ labelStyle } >Lower limit:</label>
                <input style={ inputStyle } type="text" />
            </div>
            <div>
                <label style={ labelStyle } >Upper limit:</label>
                <input style={ inputStyle } type="text" />
            </div>
        </div>)
    }

    const style = {
        margin: "1em",
        fontFamily: "Helvetica"
    }
    return (<div style={ style }>
        <ToggleButton
                title="Select data limits:"
                onChange={ onChange }
                name="limits"
                checked={ mode }
                choices={ [ "Auto", "Manual" ] } />
        { manualEls }
    </div>)
}


export default ColorbarSettings
