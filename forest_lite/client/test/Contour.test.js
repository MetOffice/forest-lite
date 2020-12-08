import React, { useEffect, useRef } from "react"
import { Provider } from "react-redux"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { createStore } from "../src/create-store.js"
import * as Bokeh from "@bokeh/bokehjs"
import { act } from "react-dom/test-utils"
import Contours from "../src/Contours.js"
import { setState } from "../src/actions.js"
import { server } from "./server.js"


// Configure test suite
beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())


test("Contours", async () => {
    const baseURL = "/contours"

    // Configure store
    const store = createStore()
    store.dispatch(setState({
        contours: true,
        dataset: 0,
        times: [0],
        time_index: 0
    }))
    const state = store.getState()
    expect(state.contours).toEqual(true)
    expect(state.dataset).toEqual(0)
    expect(state.times).toEqual([0])
    expect(state.time_index).toEqual(0)

    // Configure Bokeh Figure
    const figure = Bokeh.Plotting.figure({
        x_range: new Bokeh.Range1d({ start: 0, end: 1 }),
        y_range: new Bokeh.Range1d({ start: 0, end: 1 }),
    })
    await act(async () => {
        render(
            <Provider store={ store }>
                <Contours figure={ figure } baseURL={ baseURL } />
            </Provider>
        )
    })
    const source = figure.renderers[0].data_source
    const xs00 = 14026255.83995247 // Sample contour
    await waitFor(() => {
        expect(source.data.xs[0][0]).toEqual(xs00)
    })
    expect(figure.renderers.length).toEqual(1)
    expect(source.data).toEqual({
        value: [290, 300],
        x: [NaN, NaN],
        y: [NaN, NaN],
        z: [NaN, NaN],
        xs: [
            [14026255.83995247, 13914936.349159196],
            [14026255.83995247, 13995895.978827031]
        ],
        ys: [
            [6874936.917757867, 6952519.1760577075],
            [6958060.765936268, 6982997.920389787]
        ],
        zs: [
            [NaN, NaN],
            [NaN, NaN]
        ],
    })
})
