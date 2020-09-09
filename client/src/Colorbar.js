import React from "react"
import { connect } from "react-redux"
import * as Bokeh from "@bokeh/bokehjs"


class Colorbar extends React.Component {
    constructor(props) {
        super(props)
        const { el } = props
        const padding = 10
        const margin = 20
        const colorbarHeight = 20
        const plotHeight = colorbarHeight + 30
        const plotWidth = 300
        const figure = Bokeh.Plotting.figure({
            height: plotHeight,
            width: plotWidth,
            min_border: 0,
            background_fill_alpha: 0,
            border_fill_alpha: 0,
            outline_line_color: null,
            toolbar_location: null
        })
        figure.xaxis[0].visible = false
        figure.yaxis[0].visible = false
        const color_mapper = new Bokeh.LinearColorMapper({
            "low": 200,
            "high": 300,
            "palette": ["#440154", "#208F8C", "#FDE724"],
            "nan_color": "rgba(0,0,0,0)"
        })
        const colorbar = new Bokeh.ColorBar({
            height: colorbarHeight,
            width: plotWidth - (margin + padding),
            color_mapper: color_mapper,
            location: [0, 0],
            padding: padding,
            orientation: "horizontal",
            major_tick_line_color: "black",
            bar_line_color: "black",
            background_fill_alpha: 0,
            title: ""
        })
        figure.add_layout(colorbar, "center")
        Bokeh.Plotting.show(figure, el)
        this.state = { color_mapper }
    }
    render() {
        const { color_mapper } = this.state
        const { el, visible, limits: {low, high}, palette } = this.props

        // Hide/show container element
        if (visible) {
            el.style.display = "block"
        } else {
            el.style.display = "none"
        }

        if (palette.length === 0) return null

        // Edit palette parameters
        color_mapper.low = low
        color_mapper.high = high
        color_mapper.palette = palette

        return null
    }
}

export const mapStateToProps = state => {
    const {
        colorbar: visible = false,
        palette = [],
        limits = {low: 0, high: 1}
    } = state
    return { palette, limits, visible }
}

export default connect(mapStateToProps)(Colorbar)
