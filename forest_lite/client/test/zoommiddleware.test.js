import { zoomInOneLevel, zoomOutOneLevel } from "../src/zoom-middleware.js"


describe("zoomInOneLevel", () => {
    test("should return centered square half width length", () => {
        const actual = zoomInOneLevel({
            x_range: { start: 0, end: 4 },
            y_range: { start: 0, end: 4 }
        })
        const expected = {
            x_range: { start: 1, end: 3 },
            y_range: { start: 1, end: 3 }
        }
        expect(actual).toEqual(expected)
    })


    test("should translate in x direction", () => {
        const actual = zoomInOneLevel({
            x_range: { start: 5, end: 9 },
            y_range: { start: 0, end: 4 }
        })
        const expected = {
            x_range: { start: 6, end: 8 },
            y_range: { start: 1, end: 3 }
        }
        expect(actual).toEqual(expected)
    })


    test("should translate in y direction", () => {
        const actual = zoomInOneLevel({
            x_range: { start: 0, end: 4 },
            y_range: { start: 100, end: 200 }
        })
        const expected = {
            x_range: { start: 1, end: 3 },
            y_range: { start: 125, end: 175 }
        }
        expect(actual).toEqual(expected)
    })
})


describe("zoomOutOneLevel", () => {
    test("should return centered square twice width length", () => {
        const actual = zoomOutOneLevel({
            x_range: { start: 1, end: 3 },
            y_range: { start: 1, end: 3 }
        })
        const expected = {
            x_range: { start: 0, end: 4 },
            y_range: { start: 0, end: 4 },
        }
        expect(actual).toEqual(expected)
    })
})
