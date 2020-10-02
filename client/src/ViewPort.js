import React from "react"
import { connect } from "react-redux"
import { setFigure } from "./actions.js"
const turf = require('@turf/turf')


// User specified viewport settings
class ViewPort extends React.Component {
    componentDidMount() {
        const { baseURL = "", dispatch } = this.props
        const endpoint = `${baseURL}/viewport`
        fetch(endpoint)
            .then(response => response.json())
            .then(json => {
                console.log(json)
                const { longitude: lons, latitude: lats } = json

                // Map lons/lats to x, y
                const p0 = turf.toMercator(turf.point([
                    lons[0], lats[0]
                ]))
                const p1 = turf.toMercator(turf.point([
                    lons[1], lats[1]
                ]))
                const [x0, y0] = p0.geometry.coordinates
                const [x1, y1] = p1.geometry.coordinates

                const payload = {
                    x_range: { start: x0, end: x1 },
                    y_range: { start: y0, end: y1 },
                }
                return setFigure(payload)
            })
            .then(dispatch)
    }
    render() {
        return null
    }
}


const mapStateToProps = state => ({})


export default connect(mapStateToProps)(ViewPort)
