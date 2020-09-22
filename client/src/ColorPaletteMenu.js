import React from "react"
import {
    set_palettes,
    set_palette_number,
    set_palette_name,
    set_palette_names,
} from "./actions.js"
import { connect } from "react-redux"
import * as Bokeh from "@bokeh/bokehjs"


class _NameSelect extends React.Component {
    constructor(props) {
        super(props)

        // Select palette name widget
        let select = new Bokeh.Widgets.Select({
            options: []
        })
        this.state = { select }
    }
    componentDidMount() {
        const { select } = this.state
        const { dispatch } = this.props
        select.connect(select.properties.value.change, () => {
            let action = set_palette_name(select.value)
            dispatch(action)
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
)(_NameSelect)


class _NumberSelect extends React.Component {
    constructor(props) {
        super(props)
        let select = new Bokeh.Widgets.Select({options: []})
        this.state = { select }
    }
    componentDidMount() {
        const { select } = this.state
        const { dispatch } = this.props
        select.connect(select.properties.value.change, () => {
            let action = set_palette_number(select.value)
            dispatch(action)
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
const NumberSelect = connect(
    state => {
        const { palette_numbers: numbers = [] } = state
        const options = numbers.map((x) => x.toString())
        return { options }
    }
)(_NumberSelect)


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
        return (<>
            <NameSelect />
            <NumberSelect />
        </>)
    }
}


export const mapStateToProps = state => ({})


export default connect(mapStateToProps)(ColorPaletteMenu)
