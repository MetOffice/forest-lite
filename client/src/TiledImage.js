import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import {
    ColumnDataSource,
    HoverTool
} from "@bokeh/bokehjs/build/js/lib/models"
import * as R from "ramda"
import * as tiling from "./tiling.js"
import { set_times, setDatasetDescription } from "./actions.js"


const _HoverToolComponent = props => {
    const { figure, renderer, active, description } = props
    const [ tool, setTool ] = useState(null)

    // Add a HoverTool once after component renders
    useEffect(() => {
        const hover_tool = new HoverTool({
            renderers: [renderer],
            tooltips: [],
            active: false
        })
        figure.add_tools(hover_tool)
        setTool(hover_tool)
    }, [])

    // Update tooltip if tool or description change
    useEffect(() => {
        let tooltips = [
            ["Value", "@image @units"],
        ]
        if (typeof description != "undefined") {
            if (typeof description.data_vars.data != "undefined") {
                const pairs = R.toPairs(description.data_vars.data.attrs)
                tooltips = R.concat(tooltips, pairs)
            }
        }
        if (tool !== null) {
            tool.tooltips = tooltips
        }
    }, [tool, description])

    // Render HoverTool active state
    if (tool !== null) {
        tool.active = active
    }
    return null
}
const HoverToolComponent = connect(state => {
    const { datasets=[] } = state
    let description = null
    if (datasets.length > 0) {
        description = datasets[0].description
    }
    return { description }
})(_HoverToolComponent)


class TiledImage extends React.Component {
    constructor(props) {
        super(props)
        const { figure } = props
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
        const renderer = figure.image({
            x: { field: "x" },
            y: { field: "y" },
            dw: { field: "dw" },
            dh: { field: "dh" },
            image: { field: "image" },
            source: source,
            color_mapper: props.color_mapper,
        })
        this.state = { figure, source, renderer }
    }
    componentDidMount() {
        // Initial times
        const { dispatch, baseURL, label, datasetId } = this.props
        fetch(`${baseURL}/datasets/${label}/times?limit=7`)
            .then((response) => response.json())
            .then((data) => {
                let action = set_times(data)
                dispatch(action)
            })

        // Dataset description (TODO: Move to better place)
        let endpoint = `${baseURL}/datasets/${datasetId}`
        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                dispatch(setDatasetDescription(datasetId, data))
            })
    }
    render() {
        if (typeof this.props.ranges === "undefined") return null

        // Construct endpoint
        const { baseURL, datasetId, time } = this.props
        const templateURL = `${baseURL}/datasets/${datasetId}/data/times/${time}/tiles/{Z}/{X}/{Y}`

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
            const urls = tiles.map(([x, y, z]) => tiling.getURL(templateURL, x, y, z))
            tiling.renderTiles(this.state.source)(urls)
        }

        // HoverTool
        return <HoverToolComponent
                    figure={ this.state.figure }
                    renderer={ this.state.renderer }
                    active={ this.props.hover_tool } />
    }
}


const mapStateToProps = (state, ownProps) => {
    const { datasetId } = ownProps
    const {
        datasets = [],
        times,
        time_index,
        figure: ranges,
        hover_tool = true
    } = state
    if (typeof times === "undefined") return {}
    if (typeof time_index === "undefined") return {}
    const time = times[time_index]

    let active = false
    if (datasets.length > 0) {
        active = datasets[datasetId].active
    }

    return { ranges, time, hover_tool, active }
}


export default connect(mapStateToProps)(TiledImage)
