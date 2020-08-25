const {
    DataTileRenderer,
    getTiles,
    WEB_MERCATOR_EXTENT
} = require("./src/tiling.js")


test("constructor", () => {
    const fetch = jest.fn(() => Promise.resolve({
        json: () => Promise.resolve({})
    }))
    const figure = {
        image: () => {},
        add_tools: () => {},
        x_range: {
            connect: () => {},
            properties: {
                start: {
                    change: null
                }
            },
            start: 0,
            end: 1e5
        },
        y_range: {
            start: 0,
            end: 1e5
        }
    }
    const renderer = new DataTileRenderer(fetch, figure)
    renderer.render()
    // expect(renderer.tileCache).toEqual({})
    expect(renderer.imageCache).toEqual({})
    expect(fetch.mock.calls.length).toBe(9)
    expect(fetch.mock.calls[0][0]).toBe("/tiles/dataset/time/10/512/512")
})


test("getTiles", () => {
    const x_range = {start: 0, end: 1e5}
    const y_range = {start: 0, end: 1e5}
    const actual = getTiles(x_range, y_range, WEB_MERCATOR_EXTENT)
    const expected = [
        {x: 512, y: 512, z: 10},
        {x: 512, y: 513, z: 10},
        {x: 512, y: 514, z: 10},
        {x: 513, y: 512, z: 10},
        {x: 513, y: 513, z: 10},
        {x: 513, y: 514, z: 10},
        {x: 514, y: 512, z: 10},
        {x: 514, y: 513, z: 10},
        {x: 514, y: 514, z: 10},
    ]
    expect(actual).toEqual(expected)
})
