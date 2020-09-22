import React from "react"
import TileSelect from "./TileSelect.js"
import { connect } from "react-redux"
import { setActive, setFlag } from "./actions.js"
import "./LayerMenu.css"
import ColorPaletteMenu from "./ColorPaletteMenu.js"


class Label extends React.Component {
    render() {
        const style = {
            fontWeight: "bold",
            fontFamily: "Helvetica, Arial, sans-serif",
            marginTop: "20px",
            marginLeft: "6px",
        }
        return <div style={ style }>{ this.props.children }</div>
    }
}

class LayerMenu extends React.Component {
    render() {
        if (!this.props.visible) return null

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

        return (<>
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
        </>)
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
    const {
        layers: visible = false,
        datasets: items = []
    } = state
    return { visible, items }
}


export default connect(mapStateToProps)(LayerMenu)
