const tiling = require('./src/tiling.js')


test('interp1d interpolates midpoint of line segment', () => {
    let actual = tiling.interp1d(0, 1, 0, 1)(0.5)
    let expected = 0.5
    expect(actual).toEqual(expected)
})


test("WEB_MERCATOR_EXTENT", () => {
    const actual = tiling.WEB_MERCATOR_EXTENT
    const expected = {
        x: [ -20037508.342789244, 20037508.342789244 ],
        y: [ -20037508.342789255, 20037508.342789244 ]
    }
    expect(actual).toEqual(expected)
})

const extentEqual = (actual, expected) => {
    expect(actual.x[0]).toBeCloseTo(expected.x[0])
    expect(actual.x[1]).toBeCloseTo(expected.x[1])
    expect(actual.y[0]).toBeCloseTo(expected.y[0])
    expect(actual.y[1]).toBeCloseTo(expected.y[1])
}


const mercatorExtent = () => {
    let x0, x1, y0, y1
    x0 = tiling.WEB_MERCATOR_EXTENT.x[0]
    x1 = tiling.WEB_MERCATOR_EXTENT.x[1]
    y0 = tiling.WEB_MERCATOR_EXTENT.y[0]
    y1 = tiling.WEB_MERCATOR_EXTENT.y[1]
    return {x0, y0, x1, y1}
}

describe("extentFromXYZ()", () => {

    test("0:0:0", () => {
        let actual = tiling.extentFromXYZ([0, 0, 0])
        let expected = tiling.WEB_MERCATOR_EXTENT
        extentEqual(actual, expected)
    })

    test("0:0:1", () => {
        let actual = tiling.extentFromXYZ([0, 0, 1])
        let {x0, y0, x1, y1} = mercatorExtent()
        let expected = {
            x: [x0, 0],
            y: [y0, (y0 + y1) / 2]
        }
        extentEqual(actual, expected)
    })

    test("1:0:1", () => {
        let {x0, y0, x1, y1} = mercatorExtent()
        let actual = tiling.extentFromXYZ([1, 0, 1])
        let expected = {
            x: [(x0 + x1) / 2, x1],
            y: [y0, (y0 + y1) / 2]
        }
        extentEqual(actual, expected)
    })

    test("1:1:1", () => {
        let {x0, y0, x1, y1} = mercatorExtent()
        let actual = tiling.extentFromXYZ([1, 1, 1])
        let expected = {
            x: [(x0 + x1) / 2, x1],
            y: [(y0 + y1) / 2, y1]
        }
        extentEqual(actual, expected)
    })

    test("0:0:2", () => {
        let {x0, y0, x1, y1} = mercatorExtent()
        let actual = tiling.extentFromXYZ([0, 0, 2])
        let expected = {
            x: [x0, x0 + ((x1 - x0) / 4)],
            y: [y0, y0 + ((y1 - y0) / 4)]
        }
        extentEqual(actual, expected)
    })

    test("0:1:2", () => {
        let {x0, y0, x1, y1} = mercatorExtent()
        let actual = tiling.extentFromXYZ([0, 1, 2])
        let expected = {
            x: [x0, x0 + ((x1 - x0) / 4)],
            y: [y0 + ((y1 - y0) / 4), y0 + (2 * (y1 - y0) / 4)]
        }
        extentEqual(actual, expected)
    })

    test("11:21:5", () => {
        // General case
        let XYZ = [11, 21, 5]
        let {x0, y0, x1, y1} = mercatorExtent()
        let actual = tiling.extentFromXYZ(XYZ)
        let expected = {
            x: [
                x0 + (11 * (x1 - x0) / 2**5),
                x0 + (12 * (x1 - x0) / 2**5)
            ],
            y: [
                y0 + (21 * (y1 - y0) / 2**5),
                y0 + (22 * (y1 - y0) / 2**5)
            ]
        }
        extentEqual(actual, expected)
    })
})

test("precision", () => {
    // Check mathematically equivalent statements
    const extent = tiling.WEB_MERCATOR_EXTENT
    const y0 = extent.y[0]
    const y1 = extent.y[1]
    const actual = y0 + ((y1 - y0) / 2)
    const expected = (y0 + y1) / 2
    expect(actual).toBeCloseTo(expected)
})
