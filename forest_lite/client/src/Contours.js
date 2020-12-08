import React, { useState, useEffect } from "react"
import { connect, useSelector } from "react-redux"
import * as contour from "./contour.js"
import * as helpers from "@turf/helpers"


const STATUS = {
    IDLE: "idle",
    IN_PROGRESS: "in progress",
    FAILURE: "failed",
    SUCCESS: "success"
}


// Custom Hook to simplify usage of remote data
const useFetch = (url, active) => {
    const [ status, setStatus ] = useState(STATUS.IDLE)
    const [ data, setData ] = useState(null)
    useEffect(() => {
        if (!url) return
        if (!active) return

        const fetchData = async () => {
            setStatus(STATUS.IN_PROGRESS)
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    setData(data)
                    setStatus(STATUS.SUCCESS)
                })
        }

        fetchData()
    }, [ url, active ])
    return [ status, data ]
}


/**
 * Map server response to geoJSON feature collection
 */
const toFeatureCollection = resp => {

    // Parse response shape
    let lats = resp.coords.latitude.data
    let lons = resp.coords.longitude.data
    let values = resp.data

    // Map lon, lat, value to geoJSON points
    let points = []
    for (let i=0; i<lats.length; i++) {
        for (let j=0; j<lons.length; j++) {
            let point = helpers.point(
                [lons[j], lats[i]],
                {value: values[i][j]})
            points.push(point)
        }
    }
    return helpers.featureCollection(points)
}


const Contours = ({ figure, baseURL }) => {
    const [ contourRenderer, setContourRenderer ] = useState(null)
    const breaks = useSelector(selectBreaks)
    const visible = useSelector(selectVisible)
    const endpoint = useSelector(selectEndpoint)
    const [ status, data ] = useFetch(`${baseURL}/${endpoint}`, visible)

    // ContourRenderer helper
    useEffect(() => {
        setContourRenderer(new contour.ContourRenderer(figure))
    }, [])

    // Render features
    useEffect(() => {
        if (status === STATUS.SUCCESS) {
            if (contourRenderer != null) {
                const collection = toFeatureCollection(data)
                contourRenderer.renderFeature(collection, breaks)
            }
        }
    }, [status, contourRenderer, JSON.stringify(breaks)])

    // Hide/show GlyphRenderer
    useEffect(() => {
        if (contourRenderer != null) {
            contourRenderer.renderer.visible = visible
        }
    }, [ visible, contourRenderer ])

    return null
}


export const selectEndpoint = state => {
    const { time_index, times, dataset: id } = state
    if (typeof time_index === "undefined") return null
    if (typeof times === "undefined") return null
    if (typeof id === "undefined") return null

    // Build endpoint
    const timestamp_ms = times[time_index]
    return `datasets/${id}/times/${timestamp_ms}/points`
}


export const selectVisible = state => {
    const { contours: visible=false } = state
    return visible
}


export const selectBreaks = state => {
    // TODO: Use application state
    return [ 280, 290, 300 ]
}


export default Contours
