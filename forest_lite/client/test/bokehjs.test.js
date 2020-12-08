// Understand BokehJS API
import * as Bokeh from "@bokeh/bokehjs"


// Example to demonstrate testing Bokeh views
test("Bokeh.Plotting.show", async () => {
    const el = document.createElement("div")
    const data = {
        x: [4, 5, 6],
        y: [7, 8, 9]
    }
    const source = new Bokeh.ColumnDataSource({ data })
    const figure = Bokeh.Plotting.figure({
        plot_width: 100,
        plot_height: 100,
        x_range: new Bokeh.Range1d({ start: 0, end: 4 }),
        y_range: new Bokeh.Range1d({ start: 0, end: 4 })
    })
    const renderer = figure.circle({
        x: { field: "x" },
        y: { field: "y" },
        source: source
    })
    await Bokeh.Plotting.show(figure, el)

    // Note: assertions can be easily made against primitive values
    //       bokeh objects sometimes raise errors
    expect(renderer.visible).toEqual(true)
    expect(renderer.data_source.data).toEqual(data)
    expect(figure.plot_height).toEqual(100)
    expect(figure.renderers[0]).toBe(renderer)
})


test("figure.x_range.start change", () => {
    const listener = jest.fn()
    const x_range = new Bokeh.Range1d({ start: 0, end: 2 })
    x_range.connect(x_range.properties.start.change, listener)
    x_range.start = 1
    expect(listener.mock.calls.length).toEqual(1)
})
