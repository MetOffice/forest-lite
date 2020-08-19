// NOTE: Bokeh import is not fully supported
//       <script> tag is used instead


export function Colorbar(el) {
    const padding = 10
    const margin = 20
    const colorbarHeight = 20
    const plotHeight = colorbarHeight + 30
    const plotWidth = 300
    const figure = Bokeh.Plotting.figure({
        height: plotHeight,
        width: plotWidth,
        min_border: 0,
        background_fill_alpha: 0,
        border_fill_alpha: 0,
        outline_line_color: null,
        toolbar_location: null
    })
    figure.xaxis[0].visible = false
    figure.yaxis[0].visible = false
    this.color_mapper = new Bokeh.LinearColorMapper({
        "low": 200,
        "high": 300,
        "palette": ["#440154", "#208F8C", "#FDE724"],
        "nan_color": "rgba(0,0,0,0)"
    })
    const colorbar = new Bokeh.ColorBar({
        height: colorbarHeight,
        width: plotWidth - (margin + padding),
        color_mapper: this.color_mapper,
        location: [0, 0],
        padding: padding,
        orientation: "horizontal",
        major_tick_line_color: "black",
        bar_line_color: "black",
        background_fill_alpha: 0,
        title: ""
    })
    figure.add_layout(colorbar, "center")
    Bokeh.Plotting.show(figure, el)
}
Colorbar.prototype.render = function({ low, high, palette }) {
    this.color_mapper.low = low
    this.color_mapper.high = high
    this.color_mapper.palette = palette
}
