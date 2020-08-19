/**
 * Convert tiled arrays into isolines
 */
import * as helpers from "@turf/helpers"
import * as projection from "@turf/projection"
import isolines from "@turf/isolines"


export const ContourRenderer = function(figure) {
    let line = helpers.lineString([[0, 0], [1e6, 1e6]])
    let lines = helpers.featureCollection([line])
    console.log("constructor", lines)
    let geojson = JSON.stringify(lines)
    this.source = new Bokeh.GeoJSONDataSource({ geojson: geojson })
    this.figure = figure
    this.figure.multi_line({
        xs: {field: "xs"},
        ys: {field: "ys"},
        line_color: "gray",
        source: this.source
    })

}
ContourRenderer.prototype.render = function(data, breaks) {
    let feature = helpers.featureCollection(toPoints(data))
    this.renderFeature(feature, breaks)
}
ContourRenderer.prototype.renderFeature = function(points, breaks) {
    // Map into WebMercator space
    points = projection.toMercator(points)

    console.log(points)

    // Use turf.js to contour data
    let lines = isolines(points, breaks, {zProperty: "value"})

    console.log(lines)

    // Filter zero-length lines
    lines.features = lines.features.concat().filter((feature) => {
        return feature.geometry.coordinates.length > 0
    })
    console.log(lines)

    if (lines.features.length > 0) {
        this.source.geojson = JSON.stringify(lines)
        this.source.change.emit()
    }
}

/**
 * Map from BokehJS Image data source to GeoJSON Points
 */
export const toPoints = (data) => {
    let points = []
    let dx = data.dw / data.image.length
    let dy = data.dh / data.image[0].length
    for (let i=0; i<data.image.length; i++) {
        for (let j=0; j<data.image[i].length; j++) {
            let value = data.image[i][j]
            let px = data.x + (0.5 + i) * dx
            let py = data.y + (0.5 + j) * dy
            points.push(helpers.point([px, py], {value: value}))
        }
    }
    return points
}
