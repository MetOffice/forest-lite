import { contours } from "d3-contour"



test("d3-contour", () => {
    const fn = contours().size([2, 2]).thresholds([0.5])
    const geoJSON = fn([0, 0, 1, 1])
    const actual = geoJSON[0]["coordinates"][0][0]
    const expected = [
        [2, 1.5],
        [1.5, 1],
        [0.5, 1],
        [0, 1.5],
        [0.5, 2],
        [1.5, 2],
        [2, 1.5],
    ]
    expect(actual).toEqual(expected)
})
