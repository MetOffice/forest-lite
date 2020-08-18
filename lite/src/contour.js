/**
 * Convert tiled arrays into isolines
 */
import * as helpers from "@turf/helpers"


export const ContourRenderer = function(figure, source) {
    source.connect(source.properties.data.change, () => {
        console.log("ContourRenderer")
    })
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
