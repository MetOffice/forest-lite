// Understand BokehJS API
import * as Bokeh from "@bokeh/bokehjs"


test("figure.x_range.start change", () => {
    const listener = jest.fn()
    const x_range = new Bokeh.Range1d({ start: 0, end: 2 })
    x_range.connect(x_range.properties.start.change, listener)
    x_range.start = 1
    expect(listener.mock.calls.length).toEqual(1)
})
