import React from "react"
import { connect } from "react-redux"
import {
    ColumnDataSource
} from "@bokeh/bokehjs/build/js/lib/models"
import * as tiling from "./tiling.js"


class Tile extends React.Component {
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
            color_mapper: props.color_mapper
        })
        this.state = { source, renderer }
    }
    render() {
        console.log("props", this.props)
        console.log("state", this.state)

        if (typeof this.props.ranges === "undefined") return null
        if (typeof this.props.url === "undefined") return null

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
        const urls = tiles.map(([x, y, z]) => tiling.getURL(this.props.url, x, y, z))
        tiling.renderTiles(this.state.source)(urls)

        // No DOM elements related to component
        return null
    }
}


const mapStateToProps = state => {
    const { dataset, times, time_index, figure: ranges } = state
    if (typeof dataset === "undefined") return {}
    if (typeof times === "undefined") return {}
    if (typeof time_index === "undefined") return {}
    const time = times[time_index]
    const url = `./datasets/${dataset}/times/${time}/tiles/{Z}/{X}/{Y}`
    return { ranges, url }
}


export default connect(mapStateToProps)(Tile)
