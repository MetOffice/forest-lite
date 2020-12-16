import React, { useState } from "react"
import { ToggleButton } from "../buttons"


const ManualSettings = ({ low, setLow, high, setHigh, style }) => {
    const onLow = value => {
        setLow(value)
    }
    return (
        <div style={ style } >
            <NumericTextInput
                label="Lower limit:"
                value={ low }
                setValue={ onLow } />
            <NumericTextInput
                label="Upper limit:"
                value={ high }
                setValue={ setHigh } />
            <Message>Enter limits manually</Message>
        </div>
    )
}


const NumericTextInput = ({ label, value, setValue, disabled=false }) => {
    const [ warning, setWarning ] = useState(null)
    const styles = {
        input: {
            width: "100%",
            boxSizing: "border-box"
        },
        label: {
            display: "block"
        }
    }
    const onChange = ev => {
        if (isNaN(ev.target.value)) {
            setWarning("Only numeric values allowed")
        } else if (ev.target.value === "") {
            setWarning("Please enter a number")
        } else {
            setWarning(null)
        }
        setValue(ev.target.value)
    }
    let warnEl = null
    if (warning != null) {
        warnEl = <Message borderColor="red">{ warning }</Message>
    }
    return (
        <div>
            <label style={ styles.label } >{ label }</label>
            <input
                disabled={ disabled }
                style={ styles.input }
                value={ value }
                onChange={ onChange }
                type="text" />
            { warnEl }
        </div>
    )
}

const Message = ({ children, borderColor="#9F9" }) => {
    const messageStyle = {
        borderLeft: "4px solid " + borderColor,
        marginTop: "0.5em",
        paddingLeft: "0.5em",
        color: "#444",
    }
    return <div style={ messageStyle }>{ children }</div>
}

const AutoSettings = ({ low, high, style }) => {
    return (
        <div style={ style }>
            <NumericTextInput
                disabled={ true }
                label="Lower limit:"
                value={ low } />
            <NumericTextInput
                disabled={ true }
                label="Upper limit:"
                value={ high } />
            <Message>Use displayed data limits</Message>
        </div>)
}


const ColorbarSettings = () => {
    const [ low, setLow ] = useState(0)
    const [ high, setHigh ] = useState(1)
    const [ mode, setMode ] = useState("Auto")
    const onChange = value => {
        setMode(value)
    }
    let el = null
    const elStyle = {
        width: "100%",
        marginTop: "0.5em",
        color: "#333",
        lineHeight: "2em"
    }
    if (mode === "Manual") {
        el = <ManualSettings
                style={ elStyle }
                low={ low }
                high={ high }
                setLow={ setLow }
                setHigh={ setHigh } />
    } else {
        el = <AutoSettings
                style={ elStyle }
                low={ low }
                high={ high } />
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
        { el }
    </div>)
}


export default ColorbarSettings
