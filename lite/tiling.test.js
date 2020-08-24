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
