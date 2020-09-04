// Connect figure x_range.start property to callback
export const makeOnPanZoom = x_range => fn => {
    x_range.connect(x_range.properties.start.change, fn)
}
