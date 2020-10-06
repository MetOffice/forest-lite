import React from "react"
import { connect } from "react-redux"
import { setActive, setFlag } from "./actions.js"
import "./LayerMenu.css"
import ColorPaletteMenu from "./ColorPaletteMenu.js"
import StateToggle from "./StateToggle.js"
import Info from "./Info.js"
import HoverToolToggle from "./HoverToolToggle.js"
import ColorbarToggle from "./ColorbarToggle.js"


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


class LayerMenu extends React.Component {
    render() {
        // Datasets toggles
        const items = this.props.items
        const listItems = items.map(item => {
            const onChange = this.handleChange(item)
            return (
                <Item key={ item.id }
                         onChange={ onChange }>
                    { item.label }
                    <Info />
                </Item>
            )
        })

        const { baseURL } = this.props

        return (<div className="layer-menu-container">
            <div className="tool-icon-container">
                <StateToggle
                    icon="fas fa-layer-group"
                    attr="layers" />
                <HoverToolToggle />
                <ColorbarToggle />
            </div>
            <Hidden>
                <Label>Datasets</Label>
                <fieldset>{ listItems }</fieldset>
                <Label>Coastlines, borders, lakes</Label>
                <fieldset>
                    <CoastlinesToggle />
                </fieldset>
                <Label>Color palette</Label>
                <ColorPaletteMenu baseURL={ baseURL } />
            </Hidden>
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

class Item extends React.Component {
    render() {
        return (
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={ this.props.checked }
                        onChange={ this.props.onChange } />
                    { this.props.children }
                </label>
            </div>
        )
    }
}


const mapStateToProps = state => {
    const { datasets: items = [] } = state
    return { items }
}


export default connect(mapStateToProps)(LayerMenu)
