const turf = require('@turf/turf')

/**
 * Unit tests to learn Turf.js API
 */
test("turf.point", () => {
    let point = turf.point([0, 0], {value: 42})
    expect(point).toEqual({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [0, 0]
        },
        properties: {
            value: 42
        }
    })
})


test("turf.featureCollection", () => {
    let features = [turf.point([0, 0])]
    let actual = turf.featureCollection(features)
    expect(actual).toEqual({type: "FeatureCollection", features: features})
})

test("turf.toWgs84", () => {
    let point = turf.point([1e5, 1e5])  // Web Mercator projection
    let actual = turf.toWgs84(point)
    expect(actual).toEqual({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [
                0.8983152841195216,
                0.8982784828192615
            ]
        },
        properties: {}
    })
})

test("pointGrid", () => {
    let extent = [0, 0, 1, 1]
    let cellSide = 1
    let actual = turf.pointGrid(extent, cellSide, {units: "degrees"})
    let expected = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                geometry: {
                    coordinates: [0.5, 0.5],
                    type: "Point"
                },
                properties: {}
            }
        ]
    }
    expect(actual).toEqual(expected)
})
