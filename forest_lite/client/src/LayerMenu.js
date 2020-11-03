import React, { useState } from "react"
import { connect, useSelector, useDispatch } from "react-redux"
import { toggleActive, setFlag } from "./actions.js"
import "./LayerMenu.css"
import Info from "./Info.js"
import Tab from "./Tab.js"
import Nav from "./Nav.js"
import * as R from "ramda"


class Label extends React.Component {
    render() {
        return <div className="label">{ this.props.children }</div>
    }
}


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

const TabChoice = ({ children, onClick, active=false }) => {
    const className = `tab__choice ${active ? "tab__choice--active": ""}`
    return (
        <div className={ className } onClick={ onClick }>{ children }</div>
    )
}

const LayerMenu = () => {
    const [ tabName, setTabName ] = useState("datasets")
    const showTab = tabName => () => {
        setTabName(tabName)
    }
    return (<div className="layer-menu-container">
            <div className="tab__header">
                <TabChoice active={ tabName === "datasets" }
                           onClick={ showTab("datasets") }>
                    Datasets
                </TabChoice>
                <TabChoice active={ tabName === "navigation" }
                           onClick={ showTab("navigation") }>
                    Navigation
                </TabChoice>
            </div>
            <Tab active={ tabName === "navigation" } >
                <Nav />
            </Tab>
            <Tab active={ tabName === "datasets" } >
                <DatasetsMenu />
                <Label>Coastlines, borders, lakes</Label>
                <fieldset>
                    <CoastlinesToggle />
                </fieldset>
            </Tab>
    </div>)
}


const CoastlinesToggle = () => {
    const selector = ({ coastlines: active = true }) => active
    const active = useSelector(selector)
    const dispatch = useDispatch()
    const onChange = ev => {
        const action = setFlag({
            coastlines: ev.target.checked
        })
        dispatch(action)
    }
    return (<Item key="coastlines"
                  checked={ active }
                  onChange={ onChange }>Coastlines</Item>)

}


const Item = (props) => {
    const { checked, onChange, children } = props
    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    checked={ checked }
                    onChange={ onChange } />
                { children }
            </label>
        </div>
    )
}


const mapStateToProps = state => {
    const { datasets: items = [] } = state
    return { items }
}


export default connect(mapStateToProps)(LayerMenu)
