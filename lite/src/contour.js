/**
 * Convert tiled arrays into isolines
 */
import * as helpers from "@turf/helpers"
import * as projection from "@turf/projection"
import isolines from "@turf/isolines"
import * as Bokeh from "@bokeh/bokehjs"


export const ContourRenderer = function(figure) {
    // 0-length line to satisfy GeoJSONDataSource constructor
    let line = helpers.lineString([[0, 0], [0, 0]])
    let lines = helpers.featureCollection([line])
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
ContourRenderer.prototype.renderFeature = function(points, breaks) {
    // Map into WebMercator space
    points = projection.toMercator(points)

    // Use turf.js to contour data
    let lines = isolines(points, breaks, {zProperty: "value"})

    // Filter zero-length lines
    lines.features = lines.features.concat().filter((feature) => {
        return feature.geometry.coordinates.length > 0
    })

    if (lines.features.length > 0) {
        this.source.geojson = JSON.stringify(lines)
        this.source.change.emit()
    }
}
