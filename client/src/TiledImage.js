import React from "react"
import { connect } from "react-redux"
import {
    ColumnDataSource,
    HoverTool
} from "@bokeh/bokehjs/build/js/lib/models"
import * as tiling from "./tiling.js"


class TiledImage extends React.Component {
    constructor(props) {
        super(props)
        const source = new ColumnDataSource({
            data: {
                x: [],
                y: [],
                dw: [],
                dh: [],
                image: [],
                level: [],
                units: []
            }
        })
        const renderer = props.figure.image({
            x: { field: "x" },
            y: { field: "y" },
            dw: { field: "dw" },
            dh: { field: "dh" },
            image: { field: "image" },
            source: source,
            color_mapper: props.color_mapper,
        })

        // HoverTool
        const tooltip = "Value: @image @units"
        const hover_tool = new HoverTool({
            renderers: [renderer],
            tooltips: tooltip,
            active: false
        })
        props.figure.add_tools(hover_tool)

        this.state = { source, renderer, hover_tool }
    }
    render() {
        if (typeof this.props.ranges === "undefined") return null
        if (typeof this.props.endpoint === "undefined") return null

        this.state.renderer.visible = this.props.active

        if (this.props.active) {

            const { x_range, y_range } = this.props.ranges

            // React to axis change indirectly
            const level = tiling.findZoomLevel(
                x_range,
                y_range,
                tiling.WEB_MERCATOR_EXTENT
            )
            const tiles = tiling.getTiles(
                x_range,
                y_range,
                tiling.WEB_MERCATOR_EXTENT,
                level
            ).map(({x, y, z}) => [x, y, z])
            const { baseURL, endpoint } = this.props
            const templateURL = `${ baseURL }/${ endpoint }`
            const urls = tiles.map(([x, y, z]) => tiling.getURL(templateURL, x, y, z))
            tiling.renderTiles(this.state.source)(urls)
        }

        // HoverTool
        this.state.hover_tool.active = this.props.hover_tool

        // No DOM elements related to component
        return null
    }
}


const mapStateToProps = state => {
    const {
        dataset,
        datasets = [],
        times,
        time_index,
        figure: ranges,
        hover_tool = false
    } = state
    if (typeof dataset === "undefined") return {}
    if (typeof times === "undefined") return {}
    if (typeof time_index === "undefined") return {}
    const time = times[time_index]
    const endpoint = `datasets/${dataset}/times/${time}/tiles/{Z}/{X}/{Y}`

    let active = false
    if (datasets.length > 0) {
        active = datasets[0].active
    }

    return { ranges, endpoint, hover_tool, active }
}


export default connect(mapStateToProps)(TiledImage)
