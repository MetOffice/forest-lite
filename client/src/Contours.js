import React from "react"
import { connect } from "react-redux"
import * as contour from "./contour.js"
import * as helpers from "@turf/helpers"


class Contours extends React.Component {
    constructor(props) {
        super(props)
        const { figure } = props
        const contourRenderer = new contour.ContourRenderer(figure)
        this.state = { contourRenderer }
    }
    render() {
        console.log("DEBUG", this.state, this.props)
        const { contourRenderer } = this.state
        const { baseURL, endpoint, visible } = this.props
        contourRenderer.renderer.visible = visible
        if (typeof endpoint === "undefined") return null
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
        return null
    }
}


const mapStateToProps = state => {
    const { time_index, times, dataset: id, contours: visible=false } = state
    if (typeof time_index === "undefined") return { visible }
    if (typeof times === "undefined") return { visible }
    if (typeof id === "undefined") return { visible }

    // Build endpoint
    const timestamp_ms = times[time_index]
    const endpoint = `datasets/${id}/times/${timestamp_ms}/points`

    return { endpoint, visible }
}

export default connect(mapStateToProps)(Contours)
