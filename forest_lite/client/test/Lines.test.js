import React from "react"
import * as Bokeh from "@bokeh/bokehjs"
import { selectData } from "../src/Lines.js"


describe("selectData", () => {
    test("selectData given empty state", () => {
        let feature = "coastlines"
        let state = {}
        let actual = selectData(feature)(state)
        let expected = {
            xs: [[]],
            ys: [[]]
        }
        expect(actual).toEqual(expected)
    })
    test("selectData given almost empty state", () => {
        let feature = "coastlines"
        let state = { natural_earth_features: {} }
        let actual = selectData(feature)(state)
        let expected = {
            xs: [[]],
            ys: [[]]
        }
        expect(actual).toEqual(expected)
    })
    test("selectData given empty quadkey", () => {
        let feature = "coastlines"
        let state = { natural_earth_features: { "00": null } }
        let actual = selectData(feature)(state)
        let expected = {
            xs: [[]],
            ys: [[]]
        }
        expect(actual).toEqual(expected)
    })

    test("selectData given single quadkey", () => {
        let feature = "coastlines"
        let data = {
            xs: [[1, 2, 3]],
            ys: [[1, 2, 3]]
        }
        let quadkey = "001"
        let state = { natural_earth_features: {} }
        state.natural_earth_features[quadkey] = { coastlines: data }
        let actual = selectData(feature)(state)
        let expected = data
        expect(actual).toEqual(expected)
    })

    test("selectData given two quadkeys", () => {
        let feature = "coastlines"
        let data = {
            xs: [[1, 2, 3]],
            ys: [[1, 2, 3]]
        }
        let quadkeys = ["11", "12"]
        let state = { natural_earth_features: {} }
        quadkeys.map(quadkey => {
            state.natural_earth_features[quadkey] = { coastlines: data }
        })
        let actual = selectData(feature)(state)
        let expected = {
            xs: [
                [1, 2, 3],
                [1, 2, 3],
            ],
            ys: [
                [1, 2, 3],
                [1, 2, 3],
            ]
        }
        expect(actual).toEqual(expected)
    })
    test("selectData given missing data", () => {
        let feature = "coastlines"
        let data = {
            xs: [[1, 2, 3]],
            ys: [[1, 2, 3]]
        }
        let state = { natural_earth_features: {} }
        state.natural_earth_features["100"] = { coastlines: data }
        state.natural_earth_features["101"] = null
        let actual = selectData(feature)(state)
        let expected = {
            xs: [
                [1, 2, 3],
            ],
            ys: [
                [1, 2, 3],
            ]
        }
        expect(actual).toEqual(expected)
    })
})
