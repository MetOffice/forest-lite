import React, { useEffect } from "react"
import * as Bokeh from "@bokeh/bokehjs"
import Contours from "./Contours.js"
import Layers from "./Layers.js"
import Lines, { Coastlines, Borders } from "./Lines.js"
import OnPanZoom from "./OnPanZoom.js"
import WMTS from "./WMTS.js"
import XYRange from "./XYRange.js"


class MapFigure extends React.Component {
    constructor(props) {
        super(props)

        // Geographical map
        const xdr = new Bokeh.Range1d({ start: 0, end: 1e6 })
        const ydr = new Bokeh.Range1d({ start: 0, end: 1e6 })
        const figure = Bokeh.Plotting.figure({
            x_range: xdr,
            y_range: ydr,
            sizing_mode: "stretch_both",
        })
        figure.xaxis[0].visible = false
        figure.yaxis[0].visible = false
        figure.toolbar_location = null
        figure.min_border = 0
        figure.select_one(Bokeh.WheelZoomTool).active = true

        this.state = { figure }
    }
    componentDidMount() {
        const { figure } = this.state
        Bokeh.Plotting.show(figure, this.el)
    }
    render() {
        const { figure } = this.state
        const { baseURL, className } = this.props
        return (
            <div className={ className }
                 ref={ el => this.el = el }>
                <WMTS figure={ figure }/>
                <Layers baseURL={ baseURL } figure={ figure } />
                <Contours baseURL={ baseURL } figure={ figure } />
                <Coastlines figure={ figure } />
                <Borders figure={ figure } />
                <Lines url={ baseURL + '/atlas/disputed' }
                    figure={ figure } line_color="red" />
                <Lines url={ baseURL + '/atlas/lakes' }
                    figure={ figure } line_color="LightBlue" />
                <OnPanZoom figure={ figure } />
                <XYRange figure={ figure } />
            </div>
        )
    }
}


export default MapFigure
