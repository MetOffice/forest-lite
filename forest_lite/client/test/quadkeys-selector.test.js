import { selectQuadkeys } from "../src/quadkeys-selector.js"


test("selectQuadkeys", () => {
    let state = {}
    let actual = selectQuadkeys(state)
    let expected = []
    expect(actual).toEqual(expected)
})


test("selectQuadkeys given natural_earth_features", () => {
    let state = {
        natural_earth_features: {
            "00": null
        }
    }
    let actual = selectQuadkeys(state)
    let expected = ["00"]
    expect(actual).toEqual(expected)
})
