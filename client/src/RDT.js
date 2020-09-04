/**
 * Rapidly developing thunderstorm visualisations
 */
import React from "react"
import { connect } from "react-redux"
import * as projection from "@turf/projection"
import {
    GeoJSONDataSource,
    HoverTool
} from "@bokeh/bokehjs/build/js/lib/models"

class RDT extends React.Component {
    constructor(props) {
        super(props)
        const { figure } = props
        const empty = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [[[0, 0]]]
                    },
                    properties: {
                        NbPosLightning: 0
                    }
                }
            ]
        }
        const source = new GeoJSONDataSource({
            geojson: JSON.stringify(empty)
        })
        const renderer = figure.patches({
            xs: { field: "xs" },
            ys: { field: "ys" },
            source: source
        })
        const tool = new HoverTool({
            renderers: [renderer],
            active: true,
            tooltips: [
                ["No. of cloud-ground positive lightning strokes", "@NbPosLightning"]
            ]
        })
        figure.add_tools(tool)
        this.state = { source }
    }

    render() {
        const { source } = this.state
        const { baseURL, endpoint } = this.props
        fetch(`${baseURL}/${endpoint}`)
            .then(response => response.json())
            .then(projection.toMercator)
            .then(data => {
                source.geojson = JSON.stringify(data)
            })
        return null
    }

}


const mapStateToProps = state => ({ endpoint: "datasets/1/geojson" })


export default connect(mapStateToProps)(RDT)
