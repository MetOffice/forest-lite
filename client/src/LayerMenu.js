import React from "react"
import TileSelect from "./TileSelect.js"
import { connect } from "react-redux"
import { setActive, setFlag } from "./actions.js"


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
        listItems.push(
            <Item key="coastlines" label="Coastlines"
                  onChange={ onChange } />
        )

        // WMTS select widget
        listItems.push(
            <TileSelect />
        )

        return <fieldset>{ listItems }</fieldset>
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
                        key={ this.props.key }
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
