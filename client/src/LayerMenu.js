import React from "react"
import { connect } from "react-redux"
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


const attrsToDivs = R.pipe(
    R.toPairs,
    R.filter(pair => pair[0] !== "history"),
    R.map(R.join(": ")),
    R.map(text => <div key={ text }>{ text }</div>)
)


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
                <Label>Datasets</Label>
                <fieldset>{ listItems }</fieldset>
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


const mapStateToProps = state => {
    const { datasets: items = [] } = state
    return { items }
}


export default connect(mapStateToProps)(LayerMenu)
