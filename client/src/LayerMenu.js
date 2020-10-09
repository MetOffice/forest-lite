import React from "react"
import { connect, useDispatch, useSelector } from "react-redux"
import { setActive, setFlag } from "./actions.js"
import "./LayerMenu.css"
import ColorPaletteMenu from "./ColorPaletteMenu.js"
import StateToggle from "./StateToggle.js"
import Info from "./Info.js"
import HoverToolToggle from "./HoverToolToggle.js"
import ColorbarToggle from "./ColorbarToggle.js"
import * as R from "ramda"


class Label extends React.Component {
    render() {
        return <div className="label">{ this.props.children }</div>
    }
}


class _Hidden extends React.Component {
    render() {
        const { visible, children } = this.props
        if (!visible) return null
        return <div>{ children }</div>
    }
}
const Hidden = connect(state => {
    const { layers: visible = false } = state
    return { visible }
})(_Hidden)


const attrsToDivs = R.pipe(
    R.toPairs,
    R.filter(pair => pair[0] !== "history"),
    R.map(R.join(": ")),
    R.map(text => <div key={ text }>{ text }</div>)
)


const LayerMenu = ({ baseURL }) => {
    const dispatch = useDispatch()
    const items = useSelector(state => state.datasets || [])
    const handleChange = item => {
        return ((ev) => {
            const action = setActive({
                id: item.id,
                flag: ev.target.checked
            })
            dispatch(action)
        })
    }

    // Datasets toggles
    const listItems = items.map(item => {
        const onChange = handleChange(item)

        let description
        if (typeof item.description === "undefined") {
            description = ""
        } else {
            description = attrsToDivs(item.description.attrs)
        }

        return (
            <div key={ item.id } >
                { item.label }
                <Info>{ description }</Info>
                <DataVarsList datasetId={ item.id } />
            </div>
        )
    })

    return (<div className="layer-menu-container">
            <Label>Datasets</Label>
            <fieldset>{ listItems }</fieldset>
            <Label>Coastlines, borders, lakes</Label>
            <fieldset>
                <CoastlinesToggle />
            </fieldset>
    </div>)
}


const DataVarsList = ({ datasetId }) => {
    const dispatch = useDispatch()
    const data_vars = useSelector(state => {
        const { datasets=[] } = state
        const dataset = datasets[datasetId]
        const description = dataset.description || {}
        const data_vars = description.data_vars || {}
        return Object.keys(data_vars)
    })

    const onChange = data_var => ev => {
        const payload = { id: datasetId, data_var, flag: ev.target.checked }
        dispatch(setActive(payload))
    }

    const listItems = R.map(data_var => {
        return (
            <li key={ data_var }>
                <label>
                    <input type="checkbox"
                           onChange={ onChange(data_var) } />{ data_var }
                </label>
            </li>
        )
    })
    return <ul>{ listItems(data_vars) }</ul>
}


class _CoastlinesToggle extends React.Component {
    render() {
        // Coastlines toggle
        const { active, dispatch } = this.props
        const onChange = ev => {
            const action = setFlag({
                coastlines: ev.target.checked
            })
            this.props.dispatch(action)
        }
        return (<Item key="coastlines"
                      checked={ active }
                      onChange={ onChange }>Coastlines</Item>)
    }
}
const CoastlinesToggle = connect(state => {
    const { coastlines: active = true } = state
    return { active }
})(_CoastlinesToggle)


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


export default LayerMenu
