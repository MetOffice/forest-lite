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
    // <Label>Datasets</Label>
    // <fieldset>{ listItems }</fieldset>
    const selector = ({ datasets: items = [] }) => items
    const items = useSelector(selector)
    const divs = R.map(item => {
        const label = R.prop('label')(item)
        const lens = R.lensPath(['description', 'data_vars'])
        const data_vars = R.view(lens, item)
        return <MenuItem key={ label }
                         label={ label }
                         data_vars={ data_vars } />
    })(items)
    return (
        <div className="Menu Menu-container">
            <div className="Menu Menu-title">Datasets</div>
            <div className="Menu Menu-body">{ divs }</div>
        </div>)
}


const MenuItem = ({ children, label, data_vars }) => {
    const names = R.keys(data_vars)
    const listItems = R.map(
        name => <li key={ name }>{ name }</li>
    )(names)
    return (
        <div className="Menu Menu-item">
            <div className="Menu Menu-title">{ label }</div>
            <ul>
                { listItems }
            </ul>
        </div>)
}

class LayerMenu extends React.Component {
    render() {
        // Datasets toggles
        const items = this.props.items
        const listItems = items.map(item => {
            const onChange = this.handleChange(item)

            let description
            if (typeof item.description === "undefined") {
                description = ""
            } else {
                description = attrsToDivs(item.description.attrs)
            }

            return (
                <Item key={ item.id }
                         onChange={ onChange }>
                    { item.label }
                    <Info>{ description }</Info>
                </Item>
            )
        })

        const { baseURL } = this.props

        return (<div className="layer-menu-container">
                <DatasetsMenu />
                <Label>Coastlines, borders, lakes</Label>
                <fieldset>
                    <CoastlinesToggle />
                </fieldset>
        </div>)
    }

    handleChange(item) {
        return ((ev) => {
            const action = setActive({
                id: item.id,
                flag: ev.target.checked
            })
            this.props.dispatch(action)
        })
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
