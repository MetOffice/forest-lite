import React, { useState, useEffect } from "react"
import { connect, useDispatch, useSelector } from "react-redux"
import {
    ColumnDataSource,
    LinearColorMapper,
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
            if (typeof description.data_vars.air_temperature != "undefined") {
                const pairs = R.toPairs(description.data_vars.air_temperature.attrs)
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
const HoverToolComponent = connect((state, ownProps) => {
    const { datasets=[] } = state
    const { datasetId } = ownProps
    let description = null
    if (datasets.length > 0) {
        description = datasets[datasetId].description
    }
    return { description }
})(_HoverToolComponent)


const TiledImage = ({ figure, datasetId, label, baseURL }) => {
    const dispatch = useDispatch()
    const [color_mapper, setColormapper] = useState(null)
    const [source, setSource] = useState(null)
    const [renderer, setRenderer] = useState(null)

    useEffect(() => {
        let low, high, palette
        let color_mapper = new LinearColorMapper({
            "low": 200,
            "high": 300,
            "palette": ["#440154", "#208F8C", "#FDE724"],
            "nan_color": "rgba(0,0,0,0)"
        })
        setColormapper(color_mapper)

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
        setSource(source)

        const renderer = figure.image({
            x: { field: "x" },
            y: { field: "y" },
            dw: { field: "dw" },
            dh: { field: "dh" },
            image: { field: "image" },
            source: source,
            color_mapper: color_mapper,
        })
        setRenderer(renderer)
    }, [])

    useEffect(() => {
        // Set ColorMapper initial settings from server
        fetch(`${baseURL}/datasets/${datasetId}/palette`)
            .then(response => response.json())
            .then(({ colors, low, high }) => {
                if (color_mapper != null) {
                    color_mapper.palette = colors
                    color_mapper.low = low
                    color_mapper.high = high
                }
            })
    }, [color_mapper])

    useEffect(() => {
        // Initial times
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
    }, [])

    // Render component
    const ranges = useSelector(state => state.figure || null)
    const time = useSelector(state => {
        const { times, time_index } = state
        if (typeof times === "undefined") return null
        if (typeof time_index === "undefined") return null
        return times[time_index]
    })
    const active = useSelector(state => {
        const { datasets = [] } = state
        let active = false
        if (datasets.length > 0) {
            active = datasets[datasetId].active
        }
        return active
    })
    const hover_tool = useSelector(state => state.hover_tool || true)

    // Validate state
    if (ranges == null) {
        return null
    }
    if (time == null) {
        return null
    }

    // Construct endpoint
    const templateURL = `${baseURL}/datasets/${datasetId}/data/times/${time}/tiles/{Z}/{X}/{Y}`

    renderer.visible = active

    if (active) {

        const { x_range, y_range } = ranges

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
        tiling.renderTiles(source)(urls)
    }

    // HoverTool
    return <HoverToolComponent
                datasetId={ datasetId }
                figure={ figure }
                renderer={ renderer }
                active={ hover_tool } />
}


export default TiledImage
