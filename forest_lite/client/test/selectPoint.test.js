import React from "react"
import * as Bokeh from "@bokeh/bokehjs"
import { selectPoint } from "../src/TiledImage.js"
import { fromList } from "../src/zipper.js"


test("selectPoint given multiple dimensions", () => {
    const time = "1970-01-01T00:00:00Z"
    const pressure = "1000"
    const point = { time, pressure }
    const state = {
        navigate: {
            Foo: { Bar: {
                time: fromList([ time  ]),
                pressure: fromList([ pressure  ]),
            }
            }
        }
    }
    const actual = selectPoint("Foo", "Bar")(state)
    expect(actual).toEqual(point)
})


test("selectPoint", () => {
    const state = {
        navigate: {
            Foo: {
                Bar: {
                    "time": {
                        before: [],
                        current: "1970-01-01T00:00:00Z",
                        after: []
                    }
                }
            }
        }
    }
    const actual = selectPoint("Foo", "Bar")(state)
    const expected = {
        time: "1970-01-01T00:00:00Z"
    }
    expect(actual).toEqual(expected)
})
