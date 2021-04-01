import * as Bokeh from "@bokeh/bokehjs"


// A web component
export class Colorbar extends HTMLElement {
    constructor() {
        super()

        // TODO migrate title attribute

        let title = ""
        console.log("data-title", this.getAttribute("data-title"))

        // Use shadow DOM
        this.attachShadow({ mode: 'open' })

        // Custom elements
        const el = document.createElement("div")

        // Bokeh colorbar
        const padding = 10
        const colorbarHeight = 15
        const figure = Bokeh.Plotting.figure({
            x_range: new Bokeh.Range1d({ start: 0, end: 1 }),
            y_range: new Bokeh.Range1d({ start: 0, end: 1 }),
            height: 0,
            min_border: 0,
            background_fill_alpha: 0,
            border_fill_alpha: 0,
            outline_line_color: null,
            toolbar_location: null,
            sizing_mode: "stretch_both",
        })
        figure.xaxis[0].visible = false
        figure.yaxis[0].visible = false
        const color_mapper = new Bokeh.LinearColorMapper({
            "low": 0,
            "high": 1,
            "palette": ["#440154", "#208F8C", "#FDE724"],
            "nan_color": "rgba(0,0,0,0)"
        })
        const colorbar = new Bokeh.ColorBar({
            height: colorbarHeight,
            color_mapper: color_mapper,
            location: [0, 0],
            padding: padding,
            orientation: "horizontal",
            major_tick_line_color: "black",
            bar_line_color: "black",
            background_fill_alpha: 0,
            title: title,
            sizing_mode: "stretch_both"
        })
        figure.add_layout(colorbar, "below")
        Bokeh.Plotting.show(figure, el)
        this.shadowRoot.appendChild(el)
        this.colorbar = colorbar
        this.color_mapper = color_mapper
    }

    static get observedAttributes() {
        return ["title", "low", "high", "palette"]
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "title") {
            this.colorbar.title = newValue
        }
        if (name === "low") {
            this.color_mapper.low = JSON.parse(newValue)
        }
        if (name === "high") {
            this.color_mapper.high = JSON.parse(newValue)
        }
        if (name === "palette") {
            this.color_mapper.palette = JSON.parse(newValue)
        }
    }
}


customElements.define("bk-colorbar", Colorbar)
