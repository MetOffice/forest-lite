import React, { useState, useEffect, useCallback } from "react"
import { connect, useDispatch, useSelector } from "react-redux"
import {
    ColumnDataSource,
    LinearColorMapper,
    HoverTool
} from "@bokeh/bokehjs/build/js/lib/models"
import * as R from "ramda"
import * as tiling from "./tiling.js"
import { colorbarByIdAndVar, dataVarById } from "./datavar-selector.js"
import { set_limits, set_times, setDatasetDescription, setDatasetColorbar } from "./actions.js"
import AutoLimits from "./AutoLimits.js"


/**
 * React component to render a Bokeh HoverTool
 */
const HoverToolComponent = ({
    figure,
    renderer,
    active,
    tooltips = []
}) => {
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

    // Update tooltip if tool or tooltips change
    useEffect(() => {
        if (tool !== null) {
            tool.tooltips = tooltips
        }
    }, [tool, tooltips])

    // Render HoverTool active state
    if (tool !== null) {
        tool.active = active
    }
    return null
}


/**
 * Selector to pick tooltips from state
 */
const selectTooltips = (datasetId, dataVar) => state => {
    let tooltips = [
        ["Value", "@image @units"],
    ]

    // Parse additional tooltips from state
    const { datasets=[] } = state
    let description = null
    if (datasets.length > 0) {
        description = datasets[datasetId].description
        if (typeof description != "undefined") {
            if (typeof description.data_vars[dataVar] != "undefined") {
                const pairs = R.toPairs(description.data_vars[dataVar].attrs)
                tooltips = R.concat(tooltips, pairs)
            }
        }
    }
    return tooltips
}


/**
 * Load image(s) from REST endpoints
 */
const ImageURL = ({ urls, source, }) => {
    useEffect(() => {
        tiling.renderTiles(source)(urls)
    }, [ JSON.stringify(urls) ])
    return null
}

const getURLs = (baseURL, datasetId, dataVar, time, ranges) => {
    // Construct endpoint
    const templateURL = `${baseURL}/datasets/${datasetId}/${dataVar}/times/${time}/tiles/{Z}/{X}/{Y}`

    // Only fetch if variable selected
    if (dataVar == null) {
        return null
    }
    // Validate state
    if (ranges == null) {
        return null
    }
    if (time == null) {
        return null
    }

    const { x_range, y_range } = ranges
    if (x_range  == null) return null
    if (y_range  == null) return null

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
    return tiles.map(([x, y, z]) => tiling.getURL(templateURL, x, y, z))
}


/**
 * Tile images from application state
 */
const TiledImage = ({ figure, datasetId, label, baseURL }) => {
    const dispatch = useDispatch()
    const [source, setSource] = useState(null)
    const [renderer, setRenderer] = useState(null)
    const [color_mapper, setColormapper] = useState(null)
    const [urls, setURLs] = useState([])

    useEffect(() => {
        let color_mapper = new LinearColorMapper({
            "low": 200,
            "high": 300,
            "palette": ["#440154", "#208F8C", "#FDE724"],
            "nan_color": "rgba(0,0,0,0)"
        })
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
            color_mapper: color_mapper,
        })
        setRenderer(renderer)
        setSource(source)
        setColormapper(color_mapper)
    }, [])

    const dataVar = useSelector(dataVarById(datasetId))
    const tooltips = useSelector(selectTooltips(datasetId, dataVar))
    useEffect(() => {
        // Set ColorMapper initial settings from server
        fetch(`${baseURL}/datasets/${datasetId}/palette`)
            .then(response => response.json())
            .then(data => {
                dispatch(setDatasetColorbar(datasetId, data))
            })
    }, [color_mapper])

    useEffect(() => {
        // Initial times
        if (datasetId === 0) {
            fetch(`${baseURL}/datasets/${label}/times?limit=7`)
                .then((response) => response.json())
                .then((data) => {
                    let action = set_times(data)
                    dispatch(action)
                })
        }

        // Dataset description (TODO: Move to better place)
        let endpoint = `${baseURL}/datasets/${datasetId}`
        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                dispatch(setDatasetDescription(datasetId, data))
            })
    }, [])

    // Callback listening to source changes
    const onLimits = useCallback(
        ({ low, high }) => {
            const path = [datasetId, dataVar]
            const action = set_limits({ low, high, path })
            console.log(low, high)
            dispatch(action)
        }, [ datasetId, dataVar ])

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
            const flags = datasets[datasetId].active || {}
            active = R.any(R.identity, R.values(flags))
        }
        return active
    })
    const hover_tool = useSelector(state => state.hover_tool || true)

    const { palette, low, high } = useSelector(
        colorbarByIdAndVar(datasetId)(dataVar)
    )

    // Update LinearColorMapper
    if (color_mapper != null) {
        color_mapper.palette = palette
        color_mapper.low = low
        color_mapper.high = high
    }

    if (renderer != null) {
        renderer.visible = active
    }

    // Compute URLs
    useEffect(() => {
        const urls = getURLs(baseURL, datasetId, dataVar, time, ranges)
        if (urls != null) {
            setURLs(urls)
        }
    }, [ baseURL, datasetId, dataVar, time, JSON.stringify(ranges) ])

    if (source == null) return null
    if (renderer == null) return null
    if (color_mapper == null) return null

    return (<>
            <AutoLimits source={ source } onChange={ onLimits } />
            <HoverToolComponent
                    tooltips={ tooltips }
                    figure={ figure }
                    renderer={ renderer }
                    active={ hover_tool } />
            <ImageURL source={ source } urls={ urls } />
        </>)
}


export default TiledImage
