import React, { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { toggleActive, setOnlyActive } from "./actions.js"
import Info from "./Info.js"
import Select from "./Select.js"
import * as R from "ramda"
import "./DatasetsMenu.css"


const attrsToDivs = R.pipe(
    R.toPairs,
    R.filter(pair => pair[0] !== "history"),
    R.map(R.join(": ")),
    R.map(text => <div key={ text }>{ text }</div>)
)


const selectDatasets = ({ datasets = [] }) => datasets


const DatasetsMenu = () => {
    const [ minified, setMinified ] = useState(true)
    const datasets = useSelector(selectDatasets)
    if (minified) {
        return <MiniDatasetsMenu datasets={ datasets } />
    } else {
        return <MaxiDatasetsMenu datasets={ datasets } />
    }
}


const MiniDatasetsMenu = ({ datasets }) => {
    const dispatch = useDispatch()
    const [ value, setValue ] = useState(null)
    const callback = value => {
        if (value != "") {
            const { label: dataset, value: data_var } = JSON.parse(value)
            setValue(value) // TODO: Replace with selector
            dispatch(setOnlyActive({ dataset, data_var }))
        }
    }
    const values = datasets.map(dataset => {
        const { label, description={} } = dataset
        const data_vars = description.data_vars || {}
        const values = Object.keys(data_vars)
        return { label, values }
    })
    let label
    if (value == null) {
        label = "Dataset:"
    } else {
        const obj = JSON.parse(value)
        label = obj.label
    }
    return <Select label={ label } value={ value } values={ values } callback={ callback }/>
}


const MaxiDatasetsMenu = ({ datasets }) => {
    const items = datasets
    const divs = R.map(item => {
        const label = R.prop('label')(item)
        return <MenuItem key={ label } item={ item } />
    })(items)
    return (
        <div className="Menu Menu-container">
            <div className="Menu Menu-title">Datasets</div>
            <div className="Menu Menu-body">{ divs }</div>
        </div>)
}


const MenuItem = ({ children, item }) => {
    const dispatch = useDispatch()
    const label = R.prop('label')(item)
    let description
    if (typeof item.description === "undefined") {
        description = ""
    } else {
        description = attrsToDivs(item.description.attrs)
    }
    const dataVarsLens = R.lensPath(['description', 'data_vars'])
    const data_vars = R.view(dataVarsLens, item)
    const names = R.keys(data_vars)
    const active = item.active || {}
    const listItems = R.map(
        name => {
            const onClick = (ev) => {
                ev.preventDefault()
                const payload = { dataset: label, data_var: name }
                dispatch(toggleActive(payload))
            }
            let className
            let flag = active[name] || false
            if (flag) {
                className = "Menu__checked"
            } else {
                className = ""
            }
            return <li className={ className } key={ name } onClick={ onClick }>{ name }</li>
        }
    )(names)
    return (
        <div className="Menu Menu-item">
            <div className="Menu Menu-title-container">
                <span className="Menu Menu-title">{ label }</span>
                <Info>{ description }</Info>
            </div>
            <div className="Menu Menu-list-container">
            <ul>
                { listItems }
            </ul>
            </div>
        </div>)
}


export default DatasetsMenu
