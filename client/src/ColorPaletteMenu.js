import React from "react"
import {
    set_palettes,
    set_palette_number,
    set_palette_name,
    set_palette_names,
} from "./actions.js"
import { connect } from "react-redux"
import * as Bokeh from "@bokeh/bokehjs"


// React wrapper of Bokeh.Widgets.Select
class Select extends React.Component {
    constructor(props) {
        super(props)
        let select = new Bokeh.Widgets.Select({
            options: [],
            sizing_mode: "stretch_width"
        })
        this.state = { select }
    }
    componentDidMount() {
        const { select } = this.state
        const { dispatch, onClick } = this.props
        select.connect(select.properties.value.change, () => {
            onClick(select.value)
        })
        Bokeh.Plotting.show(select, this.el)
    }
    render() {
        const { select } = this.state
        const { options } = this.props
        select.options = options
        return <div ref={ el => this.el = el } />
    }
}

const NameSelect = connect(
    state => {
        const { palette_names: options = [] } = state
        return { options }
    }
)(Select)


const NumberSelect = connect(
    state => {
        const { palette_numbers: numbers = [] } = state
        const options = numbers.map((x) => x.toString())
        return { options }
    }
)(Select)


class ColorPaletteMenu extends React.Component {
    componentDidMount() {
        const { dispatch, baseURL } = this.props

        // Async get palette names
        fetch(`${baseURL}/palettes`)
            .then((response) => response.json())
            .then((data) => {
                let action = set_palettes(data)
                dispatch(action)
                return data
            })
            .then((data) => {
                let names = data.map((p) => p.name)
                return Array.from(new Set(names)).concat().sort()
            })
            .then((names) => {
                let action = set_palette_names(names)
                dispatch(action)
            })
    }
    render() {
        const { dispatch } = this.props
        const onClicks = {
            name: (value) => {
                let action = set_palette_name(value)
                dispatch(action)
            },
            number: (value) => {
                let action = set_palette_number(value)
                dispatch(action)
            }
        }
        return (<>
            <NameSelect onClick={ onClicks.name } />
            <NumberSelect onClick={ onClicks.number } />
        </>)
    }
}


export const mapStateToProps = state => ({})


export default connect(mapStateToProps)(ColorPaletteMenu)
