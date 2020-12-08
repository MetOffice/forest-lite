import React, { useEffect, useRef } from "react"
import { Provider } from "react-redux"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { createStore } from "../src/create-store.js"
import * as Bokeh from "@bokeh/bokehjs"
import { act } from "react-dom/test-utils"
import Contours from "../src/Contours.js"
import { server } from "./server.js"


// Configure test suite
beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())


test("Contours", async () => {
    const store = createStore()
    const figure = Bokeh.Plotting.figure({
        x_range: new Bokeh.Range1d({ start: 0, end: 1 }),
        y_range: new Bokeh.Range1d({ start: 0, end: 1 }),
    })
    await act(async () => {
        render(
            <Provider store={ store }>
                <Contours figure={ figure } />
            </Provider>
        )
    })
    expect(figure.renderers.length).toEqual(1)
    const source = figure.renderers[0].data_source
    expect(source.data).toEqual({
        x: [NaN],
        y: [NaN],
        z: [NaN],
        xs: [[0, 0]],
        ys: [[0, 0]],
        zs: [[NaN, NaN]],
    })
})
