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
                        CType: 0,
                        CRainRate: 0,
                        ConvTypeMethod: 0,
                        ConvType: 0,
                        ConvTypeQuality: 0,
                        SeverityIntensity: 0,
                        MvtSpeed: 0,
                        MvtDirection: 0,
                        NumIdCell: 0,
                        CTPressure: 0,
                        CTPhase: '',
                        CTReff: '',
                        ExpansionRate: '-',
                        BTmin: 0,
                        BTmoy: 0,
                        CTCot: '-',
                        CTCwp: '-',
                        NbPosLightning: 0,
                        SeverityType: '',
                        Surface: '',
                        Duration: 0,
                        CoolingRate: 0,
                        PhaseLife: "0",
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
                ['NumIdCell', '@NumIdCell'],
                ['Duration (Since Birth)', '@Duration{00:00:00}'],
                ["Phase life", "@PhaseLife"],
                ['Cloud Type', '@CType'], // Categorical
                ['Convective Rainfall Rate', '@CRainRate{0.0}' + ' mm/hr'],
                ['Cloud System', '@ConvType'], // Categorical
                ['Severity Type', '@SeverityType'], // Categorical
                ['Severity Intensity', '@SeverityIntensity'], // Categorical
                ['Cloud Top Phase', '@CTPhase'], // Categorical
                ['Min. Cloud Top Pressure', '@CTPressure' + ' hPa'],
                ['Expansion Rate (Past)', '@ExpansionRate{+0.0}' + ' m-2/sec'],
                ['Rate of Temp. Change', '@CoolingRate{+0.0}' + ' K/15mins'],
                ['Min. Brightness Temp', '@BTmin{0.0}' + ' K'],
                ['Average Brightness Temp', '@BTmoy{0.0}' + ' K'],
                ['Max. Cloud Optical Thickness', '@CTCot'],
                ["No. of cloud-ground positive lightning strokes", "@NbPosLightning"]
            ]
        })
        figure.add_tools(tool)
        this.state = { source }
    }

    render() {
        const { source } = this.state
        const { baseURL, endpoint } = this.props
        if (typeof this.props.endpoint === "undefined") return null
        fetch(`${baseURL}/${endpoint}`)
            .then(response => response.json())
            .then(editPhaseLife)
            .then(projection.toMercator)
            .then(data => {
                source.geojson = JSON.stringify(data)
            })
        return null
    }

}


const mapStateToProps = state => {
    const { times, time_index } = state
    if (typeof times === "undefined") return {}
    if (typeof time_index === "undefined") return {}
    const time = times[time_index]
    return { endpoint: `datasets/1/times/${time}/geojson` }
}


export default connect(mapStateToProps)(RDT)
