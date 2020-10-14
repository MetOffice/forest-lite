import React from "react"
import { connect, useSelector, useDispatch } from "react-redux"
import { setActive, setFlag } from "./actions.js"
import "./LayerMenu.css"
import ColorPaletteMenu from "./ColorPaletteMenu.js"
import Info from "./Info.js"
import HoverToolToggle from "./HoverToolToggle.js"
import ColorbarToggle from "./ColorbarToggle.js"
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
    const listItems = R.addIndex(R.map)(
        (name, index) => {
            const onClick = () => {
                const payload = { dataset: label, data_var: name }
                const action = { type: "TOGGLE_ACTIVE", payload }
                dispatch(action)
            }
            let className
            if (index === 0) {
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

class LayerMenu extends React.Component {
    render() {
        return (<div className="layer-menu-container">
                <DatasetsMenu />
                <Label>Coastlines, borders, lakes</Label>
                <fieldset>
                    <CoastlinesToggle />
                </fieldset>
        </div>)
    }
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
