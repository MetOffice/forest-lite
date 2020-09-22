import React from "react"
import {
    set_palettes,
    set_palette_names,
} from "./actions.js"
import { connect } from "react-redux"


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
        return null
    }
}


export const mapStateToProps = state => ({})


export default connect(mapStateToProps)(ColorPaletteMenu)
