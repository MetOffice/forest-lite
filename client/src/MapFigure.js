import React from "react"
import * as Bokeh from "@bokeh/bokehjs"
import ColorPalette from "./ColorPalette.js"
import Layers from "./Layers.js"
import Lines from "./Lines.js"
import OnPanZoom from "./OnPanZoom.js"
import WMTS from "./WMTS.js"


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

        // TODO: Move inside Layer component
        let color_mapper = new Bokeh.LinearColorMapper({
            "low": 200,
            "high": 300,
            "palette": ["#440154", "#208F8C", "#FDE724"],
            "nan_color": "rgba(0,0,0,0)"
        })

        this.state = { figure, color_mapper }
    }
    componentDidMount() {
        const { figure } = this.state
        Bokeh.Plotting.show(figure, this.el)
    }
    render() {
        const { figure, color_mapper } = this.state
        const { baseURL } = this.props
        return (
            <div ref={ el => this.el = el }>
                <WMTS figure={ figure }/>
                <Layers baseURL={ baseURL } figure={ figure }
                    color_mapper={ color_mapper } />
                <ColorPalette
                    color_mapper={ color_mapper } />
                <Lines url={ baseURL + '/atlas/coastlines' }
                    figure={ figure } />
                <Lines url={ baseURL + '/atlas/borders' }
                    figure={ figure } />
                <Lines url={ baseURL + '/atlas/disputed' }
                    figure={ figure } line_color="red" />
                <Lines url={ baseURL + '/atlas/lakes' }
                    figure={ figure } line_color="LightBlue" />
                <OnPanZoom figure={ figure } />
            </div>
        )
    }
}


export default MapFigure
