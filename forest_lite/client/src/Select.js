import React from "react"
import "./Select.css"


/**
 * HTML Select widget
 */
const Select = ({ value, values = [], label, callback = null }) => {
    const onChange = ev => {
        if (callback != null) {
            callback(ev.target.value)
        }
    }
    const options = values.map(option => {
        // TODO: Support optgroup
        if (typeof option !== "object") {
            return <option key={ option }
                           value={ option }>{ option }</option>
        } else {
            const { label="", values=[] } = option
            const subOptions = values.map(value => {
                const key = JSON.stringify({ label, value })
                return <option key={ key } value={ key }>{ value }</option>
            })
            return <optgroup key={ label } label={ label }>{ subOptions }</optgroup>
        }
    })
    return (<div className="select__container">
        <label
            className="select__label"
            htmlFor="unique-select">{ label }</label>
        <select
                id="unique-select"
                data-testid="select"
                onChange={ onChange }
                className="select__select"
                value={ value || "" }>
            <option value="">Please select</option>
            { options }
        </select>
    </div>)
}


export default Select
