/**
 * Rapidly developing thunderstorm visualisations
 */
import React from "react"
import { connect } from "react-redux"
import * as projection from "@turf/projection"
import {
    CategoricalColorMapper,
    GeoJSONDataSource,
    HoverTool
} from "@bokeh/bokehjs/build/js/lib/models"
const { editPhaseLife } = require("../src/edit-phase-life.js")


class RDT extends React.Component {
    constructor(props) {
        super(props)
        const { figure } = props
        const color_mapper = new CategoricalColorMapper({
            palette: ["#fee8c8", "#fdbb84", "#e34a33", "#43a2ca", "#a8ddb5"],
            factors: [
                "Triggering",
                "Triggering from split",
                "Growing",
                "Mature",
                "Decaying"]
        })
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
                        PhaseLife: "0",
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
            fill_alpha: 0,
            line_width: 2,
            line_color: { field: "PhaseLife", transform: color_mapper },
            source: source
        })
        const tool = new HoverTool({
            renderers: [renderer],
            active: true,
            tooltips: [
                ["Phase life", "@PhaseLife"],
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
            .then(editPhaseLife)
            .then((d) => {
                console.log(d)
                return d
            })
            .then(projection.toMercator)
            .then(data => {
                source.geojson = JSON.stringify(data)
            })
        return null
    }

}


const mapStateToProps = state => ({ endpoint: "datasets/1/geojson" })


export default connect(mapStateToProps)(RDT)
