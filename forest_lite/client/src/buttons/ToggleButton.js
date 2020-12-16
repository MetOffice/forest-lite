import React, { useState } from "react"
import "./ToggleButton.css"


// Toggle between options
const ToggleButton = ({ name, choices = [], onChange = null,
    title = "",
    checked = null
}) => {
    const classNames = {
        container: "ToggleButton__container",
        title: "ToggleButton__title",
        input: "ToggleButton__input",
        form: "ToggleButton__form",
        div: "ToggleButton__div",
        label: "ToggleButton__label"
    }
    const handleChange = ev => {
        onChange(ev.target.value)
    }
    const innerEls = choices.map(choice => {
        let active = null
        if (checked != null) {
            active = choice === checked
        }
        return (
            <div key={ choice } className={ classNames.div }>
                <input
                    id={ name + choice }
                    className={ classNames.input }
                    type="radio"
                    name={ name }
                    value={ choice }
                    checked={ active }
                    onChange={ handleChange } />
                <label
                    htmlFor={ name + choice }
                    className={ classNames.label }>{ choice }</label>
            </div>
        )
    })
    let titleEl = null
    if (title !== "") {
        titleEl = <div className={ classNames.title }>{ title }</div>
    }
    return (<div className={ classNames.container }>
        { titleEl }
        <form className={ classNames.form }>{ innerEls }</form>
    </div>)
}


export default ToggleButton
