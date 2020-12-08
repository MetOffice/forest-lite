import React, { useState, useEffect } from "react"
import { connect, useSelector } from "react-redux"
import * as contour from "./contour.js"
import * as helpers from "@turf/helpers"


const Contours = ({ figure, baseURL }) => {
    const [ contourRenderer, setContourRenderer ] = useState(null)
    const visible = useSelector(selectVisible)
    const endpoint = useSelector(selectEndpoint)

    useEffect(() => {
        setContourRenderer(new contour.ContourRenderer(figure))
    }, [])

    useEffect(() => {
        if (contourRenderer != null) {
            contourRenderer.visible = visible
        }
    }, [ visible, contourRenderer ])

    useEffect(() => {
        if (contourRenderer != null) {
            if (visible) {
                // Fetch data, draw and reveal contours
                // (TODO: separate concerns)
                let url = `${baseURL}/${endpoint}`
                fetch(url)
                    .then(response => response.json())
                    .then((data) => {
                        let lats = data.coords.latitude.data
                        let lons = data.coords.longitude.data
                        let values = data.data
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
                    })
                    .then((feature) => {
                        let breaks = [280, 290, 300]
                        contourRenderer.renderFeature(feature, breaks)
                    })
            }
        }
    }, [ visible, endpoint, contourRenderer ])

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


export default Contours
