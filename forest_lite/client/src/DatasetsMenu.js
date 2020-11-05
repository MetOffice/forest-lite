import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { toggleActive } from "./actions.js"
import Info from "./Info.js"
import * as R from "ramda"


const attrsToDivs = R.pipe(
    R.toPairs,
    R.filter(pair => pair[0] !== "history"),
    R.map(R.join(": ")),
    R.map(text => <div key={ text }>{ text }</div>)
)


const DatasetsMenu = () => {
    const selector = ({ datasets: items = [] }) => items
    const items = useSelector(selector)
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
