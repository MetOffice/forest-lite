const turf = require("@turf/turf")
const contour = require("./src/contour")


test("toPoints", () => {
    let data = {
        x: 0,
        y: 0,
        dw: 1,
        dh: 1,
        image: [[0, 1], [2, 3]]
    }
    let actual = contour.toPoints(data)
    let expected = [
        turf.point([0.25, 0.25], {value: 0}),
        turf.point([0.25, 0.75], {value: 1}),
        turf.point([0.75, 0.25], {value: 2}),
        turf.point([0.75, 0.75], {value: 3}),
    ]
    expect(actual).toEqual(expected)
})
