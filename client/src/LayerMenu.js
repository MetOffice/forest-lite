import React from "react"
import TileSelect from "./TileSelect.js"
import { connect } from "react-redux"
import { setActive, setFlag } from "./actions.js"
import "./LayerMenu.css"
import ColorPaletteMenu from "./ColorPaletteMenu.js"
import StateToggle from "./StateToggle.js"
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
            return <Item key={ item.id }
                         label={ item.label }
                         onChange={ onChange } />
        })

        // Coastlines toggle
        const onChange = ev => {
            const action = setFlag({
                coastlines: ev.target.checked
            })
            this.props.dispatch(action)
        }

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
                <Label>Backgrounds</Label>
                <TileSelect />
                <Label>Datasets</Label>
                <fieldset>{ listItems }</fieldset>
                <Label>Coastlines, borders, lakes</Label>
                <fieldset>
                    <Item key="coastlines" label="Coastlines"
                          onChange={ onChange } />
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


class Item extends React.Component {
    render() {
        return (
            <div>
                <label>
                    <input type="checkbox"
                        onChange={ this.props.onChange } />
                    { this.props.label }
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
