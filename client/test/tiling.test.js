const tiling = require('../src/tiling.js')


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


describe("tiling", () => {
    test("getURL()", () => {
        const actual = tiling.getURL("/some/{Z}/{X}/{Y}", 0, 1, 2)
        const expected = "/some/2/0/1"
        expect(actual).toEqual(expected)
    })

    test("getTiles", () => {
        const limits = {x: [0, 1], y: [0, 1]}
        const x_range = {start: 0, end: 1}
        const y_range = {start: 0, end: 1}
        const level = 0
        const actual = tiling.getTiles(x_range, y_range, limits, level)
        const expected = [
            {x: 0, y: 0, z: 0},
        ]
        expect(actual.length).toEqual(expected.length)
        expect(actual).toEqual(expected)
    })

    test("worldCoordinates", () => {
        const limits = {x: [0, 1], y: [0, 1]}
        const x_range = {start: 0, end: 1}
        const y_range = {start: 0, end: 1}
        const actual = tiling.worldCoordinates(x_range, y_range, limits)
        const expected = {
            x: { start: 0, end: 256 },
            y: { start: 0, end: 256 },
        }
        expect(actual).toEqual(expected)
    })

    test("pixelIndex", () => {
        const worldCoord = 256
        const level = 2
        const actual = tiling.pixelIndex(worldCoord, level)
        const expected = 1024
        expect(actual).toEqual(expected)
    })

    test("tileIndex", () => {
        const pixelIndex = 1024
        const actual = tiling.tileIndex(pixelIndex)
        const expected = 4
        expect(actual).toEqual(expected)
    })
})


test("zoomLevel", () => {
    const extent = {x: {start: 0, end: 256}, y: {start: 0, end: 256}}
    const actual = tiling.zoomLevel(extent)
    const expected = -1
    expect(actual).toEqual(expected)
})

test.each`
    extent            | expected
    ${ [0, 0, 1, 1] } | ${ Math.sqrt(2) }
`("viewportSize", ({ extent, expected }) => {
    const [ x0, y0, x1, y1 ] = extent
    const actual = tiling.viewportSize({
        x: {start: x0, end: x1},
        y: {start: y0, end: y1}
    })
    expect(actual).toEqual(expected)
})

test.each`
  tile | expected
  ${ [0, 0, 0] } | ${ true }
  ${ [1, 0, 0] } | ${ false }
  ${ [0, 1, 0] } | ${ false }
  ${ [3, 3, 2] } | ${ true }
`("$tile returns $expected", ({ tile, expected }) => {
    expect(tiling.validTile(tile)).toEqual(expected)
})
