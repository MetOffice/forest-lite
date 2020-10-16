import React from "react"
import { connect, useSelector } from "react-redux"
import * as Bokeh from "@bokeh/bokehjs"
import * as R from "ramda"
import { compose, identity, filter, keys } from "ramda"
import { colorbarByIdAndVar, dataVarById } from "./datavar-selector.js"
import "./Colorbar.css"


const ColorbarTitle = ({ colorbar, datasetId }) => {
    const title = useSelector(state => {
        const { datasets = [] } = state
        const { active = {}, description = {} } = datasets[datasetId]
        const { data_vars ={} } = description
        const activeVars = compose(keys, filter(identity))(active)
        if (activeVars.length > 0) {
            const data_var = data_vars[activeVars[0]]
            const { attrs = {} } = data_var
            const { units = "", standard_name = "" } = attrs
            return `${standard_name} [${units}]`
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
    const {
        active: flags = {}
    } = datasets[datasetId]

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
