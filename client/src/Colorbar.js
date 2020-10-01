import React from "react"
import { connect } from "react-redux"
import * as Bokeh from "@bokeh/bokehjs"
import "./Colorbar.css"


class Colorbar extends React.Component {
    constructor(props) {
        super(props)
        const { el } = props
        const padding = 10
        const colorbarHeight = 20
        const figure = Bokeh.Plotting.figure({
            height: 0,
            min_border: 0,
            background_fill_alpha: 0,
            border_fill_alpha: 0,
            outline_line_color: null,
            toolbar_location: null,
            sizing_mode: "stretch_both"
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
            color_mapper: color_mapper,
            location: [0, 0],
            padding: padding,
            orientation: "horizontal",
            major_tick_line_color: "black",
            bar_line_color: "black",
            background_fill_alpha: 0,
            title: "",
            sizing_mode: "stretch_both"
        })
        figure.add_layout(colorbar, "below")
        this.state = { color_mapper, figure }
    }
    componentDidMount() {
        const { figure } = this.state
        Bokeh.Plotting.show(figure, this.el)
    }
    render() {
        const { color_mapper } = this.state
        const { visible, limits: {low, high}, palette } = this.props

        // Hide/show container element
        let style
        if (visible) {
            style = { display: "block" }
        } else {
            style = { display: "none" }
        }

        if (palette.length === 0) {
            return <div style={ style }
                        className="colorbar-container"
                        ref={ el => this.el = el } />
        }

        // Edit palette parameters
        color_mapper.low = low
        color_mapper.high = high
        color_mapper.palette = palette

        return <div style={ style }
                    className="colorbar-container"
                    ref={ el => this.el = el } />
    }
}

export const mapStateToProps = state => {
    const {
        colorbar: visible = true,
        palette = [],
        limits = {low: 0, high: 1}
    } = state
    return { palette, limits, visible }
}

export default connect(mapStateToProps)(Colorbar)
