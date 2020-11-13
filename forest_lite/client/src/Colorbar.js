import React from "react"
import { connect, useSelector } from "react-redux"
import * as Bokeh from "@bokeh/bokehjs"
import * as R from "ramda"
import { compose, identity, filter, keys } from "ramda"
import { colorbarByIdAndVar, dataVarById } from "./datavar-selector.js"
import "./Colorbar.css"
import { findById } from "./helpers.js"


const ColorbarTitle = ({ colorbar, datasetId }) => {
    const title = useSelector(state => {
        const { datasets = [] } = state
        const { active = {}, description = {} } = findById(datasets, datasetId)
        const { data_vars ={} } = description
        const activeVars = compose(keys, filter(identity))(active)
        if (activeVars.length > 0) {
            const data_var = data_vars[activeVars[0]]
            const { attrs = {} } = data_var
            const {
                units = "",
                standard_name = false,
                long_name = false } = attrs
            const name = standard_name || long_name || ""
            return `${name} [${units}]`
        }
        return ""
    })
    colorbar.title = title
    return null
}

class Colorbar extends React.Component {
    constructor(props) {
        super(props)
        const { el, title = "" } = props
        const padding = 10
        const colorbarHeight = 15
        const figure = Bokeh.Plotting.figure({
            x_range: new Bokeh.Range1d({ start: 0, end: 1 }),
            y_range: new Bokeh.Range1d({ start: 0, end: 1 }),
            height: 0,
            min_border: 0,
            background_fill_alpha: 0,
            border_fill_alpha: 0,
            outline_line_color: null,
            toolbar_location: null,
            sizing_mode: "stretch_both",
        })
        figure.xaxis[0].visible = false
        figure.yaxis[0].visible = false
        const color_mapper = new Bokeh.LinearColorMapper({
            "low": 0,
            "high": 1,
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
            title: title,
            sizing_mode: "stretch_both"
        })
        figure.add_layout(colorbar, "below")
        this.state = { color_mapper, figure, colorbar }
    }
    componentDidMount() {
        const { figure } = this.state
        Bokeh.Plotting.show(figure, this.el)
    }
    render() {
        const { color_mapper, colorbar } = this.state
        const { visible, limits: {low, high}, palette } = this.props
        const { datasetId } = this.props

        color_mapper.low = low
        color_mapper.high = high

        // Hide/show container element
        let style
        if (visible) {
            style = { display: "block" }
        } else {
            style = { display: "none" }
        }

        if (palette.length !== 0) {
            // Edit palette parameters
            color_mapper.palette = palette
        }

        return (
            <div style={ style }
                    className="colorbar-container"
                    ref={ el => this.el = el }>
                <ColorbarTitle
                    datasetId={ datasetId }
                    colorbar={ colorbar } />
            </div>
        )
    }
}

export const mapStateToProps = (state, ownProps) => {
    const { datasetId } = ownProps
    const { datasets = [] } = state
    const dataset = findById(datasets, datasetId)
    const {
        active: flags = {}
    } = dataset

    const dataVar = dataVarById(datasetId)(state)
    const colorbar = colorbarByIdAndVar(datasetId)(dataVar)(state)
    const {
        palette = [],
        low = 0,
        high = 1,
    } = colorbar
    const limits = { low, high }
    const visible = R.any(R.identity, R.values(flags))
    return { palette, limits, visible }
}

export default connect(mapStateToProps)(Colorbar)
