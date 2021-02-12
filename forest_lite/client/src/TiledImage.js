import React, { useState, useEffect, useCallback } from "react"
import { connect, useDispatch, useSelector } from "react-redux"
import {
    ColumnDataSource,
    LinearColorMapper,
    HoverTool
} from "@bokeh/bokehjs/build/js/lib/models"
import * as R from "ramda"
import {
    head,
    map,
    mapObjIndexed,
    filter,
    prop,
    propEq,
    pipe,
    compose,
    lensIndex,
    lensPath,
    lensProp,
    view
} from "ramda"
import * as tiling from "./tiling.js"
import { colorbarByIdAndVar, dataVarById } from "./datavar-selector.js"
import { set_limits, set_times, setDatasetDescription, setDatasetColorbar } from "./actions.js"
import AutoLimits from "./AutoLimits.js"
import { findById } from "./helpers.js"
import { selectPorts } from "./ports-selector.js"


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
    if (datasets.length > 0) {
        const { description } = findById(datasets, datasetId)
        if (typeof description != "undefined") {
            const { data_vars={} } = description
            if (typeof data_vars[dataVar] != "undefined") {
                const pairs = R.toPairs(data_vars[dataVar].attrs)
                tooltips = R.concat(tooltips, pairs)
            }
        }
    }
    return tooltips
}


/**
 * Select a point
 */
export const selectPoint = (datasetName, dataVar) => {
    return pipe(
        view(lensPath(["navigate", datasetName, dataVar])),
        mapObjIndexed(prop("current"))
    )
}

/**
 * Select dataset name from ID
 */
export const selectDatasetName = id => state => {
    const { datasets =[] } = state
    return pipe(
        filter(propEq("id", id)),
        map(prop("label")),
        head
    )(datasets)
}

/**
 * Load image(s) from REST endpoints
 */
export const ImageURL = ({ urls, source, }) => {
    useEffect(() => {
        tiling.renderTiles(source)(urls)
    }, [ JSON.stringify(urls) ])
    return null
}


/**
 * Map state to {Z}/{X}/{Y} URL
 */
export const getTemplate = (baseURL, datasetId, dataVar, time) => {
    if (dataVar == null) return null
    if (time == null) return null
    return `${baseURL}/datasets/${datasetId}/${dataVar}/times/${time}/tiles/{Z}/{X}/{Y}`
}


/**
 * Map state to {Z}/{X}/{Y} URL
 */
export const getTemplateQuery = (baseURL, datasetId, dataVar, query=null) => {
    if (dataVar == null) return null
    const url = `${baseURL}/datasets/${datasetId}/${dataVar}/tiles/{Z}/{X}/{Y}`
    if (query == null) {
        // Support 0-dimensional data
        return url
    } else {
        const q = JSON.stringify(query)
        return `${url}?query=${q}`
    }
}


/**
 * Fill in Z, X and Y values
 */
export const getURLs = (templateURL, ranges) => {
    if (templateURL == null) return null
    if (ranges == null) return null

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
 * Initialise application navigation state
 */
export const InitialTimes = ({ baseURL, datasetId, label }) => {
    const dispatch = useDispatch()
    useEffect(() => {
        if (datasetId === 0) {
            const endpoint = `${baseURL}/datasets/${label}/times?limit=7`
            fetch(endpoint)
                .then(response => {
                    if (!response.ok) {
                        console.error("Not OK")
                    }
                    return response.json()
                })
                .then((data) => {
                    let action = set_times(data)
                    dispatch(action)
                })
        }
    }, [])
    return null
}


/**
 * Initialise dataset description state
 */
export const DatasetDescription = ({ baseURL, datasetId }) => {
    const dispatch = useDispatch()
    useEffect(() => {
        let endpoint = `${baseURL}/datasets/${datasetId}`
        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                dispatch(setDatasetDescription(datasetId, data))
            })
    }, [])
    return null
}


/**
 * Console log REST URLs
 */
const URLPrinter = ({ template, ranges }) => {
    useEffect(() => {
        const urls = getURLs(template, ranges)
        if (urls != null) {
            urls.map(url => console.log(url))
        }
    }, [ template, JSON.stringify(ranges) ])
    return null
}


/**
 * Tile images from application state
 */
const TiledImage = ({ figure, datasetId, baseURL }) => {
    const ports = useSelector(selectPorts)
    const dispatch = useDispatch()
    const [source, setSource] = useState(null)
    const [renderer, setRenderer] = useState(null)
    const [color_mapper, setColormapper] = useState(null)
    const [ template, setTemplate ] = useState(null)
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

        return () => {
            const index = figure.renderers.indexOf(renderer)
            if (index != -1) {
                figure.renderers.splice(index, 1)
            }
        }
    }, [])

    // Configure REST URL template
    const datasetName = useSelector(selectDatasetName(datasetId))
    const dataVar = useSelector(dataVarById(datasetId))
    const time = useSelector(state => {
        const { times, time_index } = state
        if (typeof times === "undefined") return null
        if (typeof time_index === "undefined") return null
        return times[time_index]
    })
    const query = useSelector(selectPoint(datasetName, dataVar))
    useEffect(() => {
        setTemplate(getTemplateQuery(baseURL, datasetId, dataVar, query))
    }, [ baseURL, datasetId, dataVar, JSON.stringify(query) ])

    // Configure tooltips
    const tooltips = useSelector(selectTooltips(datasetId, dataVar))
    useEffect(() => {
        // Set ColorMapper initial settings from server
        fetch(`${baseURL}/datasets/${datasetId}/palette`)
            .then(response => response.json())
            .then(data => {
                dispatch(setDatasetColorbar(datasetId, data))
            })
    }, [color_mapper, datasetId])

    // Callback listening to source changes
    const onLimits = useCallback(
        ({ low, high }) => {
            const path = [datasetId, dataVar]
            const action = set_limits({ low, high, path })
            ports.receiveData.send({ label: "action", payload: action })
        }, [ datasetId, dataVar ])

    // Render component
    const ranges = useSelector(state => state.figure || null)

    const active = useSelector(state => {
        const { datasets = [], visible = true } = state
        if (visible === false) return false
        let active = false
        if (datasets.length > 0) {
            const flags = findById(datasets, datasetId).active || {}
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
        const urls = getURLs(template, ranges)
        if (urls != null) {
            setURLs(urls)
        }
    }, [ template, JSON.stringify(ranges) ])

    if (source == null) return null
    if (renderer == null) return null
    if (color_mapper == null) return null

    return (<>
            <URLPrinter
                template={ template }
                ranges={ ranges }
                />
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
