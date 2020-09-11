import React from "react"
import * as Bokeh from "@bokeh/bokehjs"
import Lines from "./Lines.js"
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

        this.state = { figure }
    }
    componentDidMount() {
        const { figure } = this.state
        Bokeh.Plotting.show(figure, this.el)
    }
    render() {
        const { figure } = this.state
        const { baseURL } = this.props
        return (
            <div ref={ el => this.el = el }>
                <WMTS figure={ figure }/>
                <Lines url={ baseURL + '/atlas/coastlines' }
                    figure={ figure } />
                <Lines url={ baseURL + '/atlas/borders' }
                    figure={ figure } />
                <Lines url={ baseURL + '/atlas/disputed' }
                    figure={ figure } line_color="red" />
                <Lines url={ baseURL + '/atlas/lakes' }
                    figure={ figure } line_color="LightBlue" />
            </div>
        )
    }
}


export default MapFigure
