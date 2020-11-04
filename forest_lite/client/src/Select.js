import React from "react"
import "./Select.css"


/**
 * HTML Select widget
 */
const Select = ({ value, values, label, callback }) => {
    const onChange = ev => {
        callback(ev.target.value)
    }
    const options = values.map(option => {
        return <option key={ option }
                       value={ option }>{ option }</option>
    })
    return (<div className="select__container">
        <label
            className="select__label"
            htmlFor="unique-select">{ label }</label>
        <select
                id="unique-select"
                onChange={ onChange }
                className="select__select"
                value={ value || "" }>
            <option value="">Please select</option>
            { options }
        </select>
    </div>)
}


export default Select
