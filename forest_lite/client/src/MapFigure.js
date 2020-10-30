import React, { useEffect } from "react"
import * as Bokeh from "@bokeh/bokehjs"
import Contours from "./Contours.js"
import Layers from "./Layers.js"
import Lines from "./Lines.js"
import OnPanZoom from "./OnPanZoom.js"
import WMTS from "./WMTS.js"
import XYRange from "./XYRange.js"
import { ImageFn } from "../extension"


window.ImageFn = ImageFn


// Make an ImageFn glyph_renderer for a figure
const ImageAnimation = ({figure}) => {
    useEffect(() => {
        const color_mapper = new Bokeh.LinearColorMapper({
            low: 0,
            high: 3,
            palette: ["red", "green", "blue"]
        })
        const source = new Bokeh.ColumnDataSource({
            data: {
                x: [5009377.085697312],
                y: [-7.450580596923828e-09],
                dw: [626172.1357121617],
                dh: [626172.1357121654],
                image: [
                    [[0, 1],
                     [2, 3]]
                ],
            }
        })
        const args = {
            x: { field: "x" },
            y: { field: "y" },
            dw: { field: "dw" },
            dh: { field: "dh" },
            image: { field: "image" },
            color_mapper: color_mapper,
            source: source
        }
        const renderer = figure._glyph.bind(figure)(
            ImageFn,
            "color_mapper,image,rows,cols,x,y,dw,dh",
            [args])
        console.log(renderer.glyph.parameter)
    }, [])
    return null
}


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
                <Lines url={ baseURL + '/atlas/coastlines' }
                    figure={ figure } />
                <Lines url={ baseURL + '/atlas/borders' }
                    figure={ figure } />
                <Lines url={ baseURL + '/atlas/disputed' }
                    figure={ figure } line_color="red" />
                <Lines url={ baseURL + '/atlas/lakes' }
                    figure={ figure } line_color="LightBlue" />
                <OnPanZoom figure={ figure } />
                <XYRange figure={ figure } />
                <ImageAnimation figure={ figure } />
            </div>
        )
    }
}


export default MapFigure
