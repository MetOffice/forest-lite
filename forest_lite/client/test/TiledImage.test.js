import React from "react"
import { Provider } from "react-redux"
import "@testing-library/jest-dom/extend-expect"
import { act } from "react-dom/test-utils"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import * as Bokeh from "@bokeh/bokehjs"
import TiledImage from "../src/TiledImage.js"
import { createStore } from "../src/create-store.js"
import { set_times, setFigure, setOnlyActive, set_datasets } from "../src/actions.js"
import { server } from "./server.js"


// Configure mock service worker
beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())


test("TiledImage", async () => {
    const store = createStore()
    const figure = Bokeh.Plotting.figure()
    const datasetId = 0
    const dataset = "Foo"
    const dataVar = "Bar"
    const baseURL = "/base"
    await act(async () => {
        await render(
            <Provider store={ store } >
                <TiledImage
                    figure={ figure }
                    datasetId={ datasetId }
                    baseURL={ baseURL } />
            </Provider>
        )


        // Dispatch initialisation actions
        const actions = [
            set_times([ 0 ]),
            setFigure({
                x_range: { start: 0, end: 1e6 },
                y_range: { start: 0, end: 1e6 }
            }),
            set_datasets([ {
                label: dataset,
                id: datasetId,
                driver: "nearcast",
                view: "tiled_image",
            } ]),
            setOnlyActive({ dataset, data_var: dataVar })
        ]
        actions.map(action => {
            store.dispatch(action)
        })

        // Check application state
        const actual = store.getState()
        const expected = {
            time_index: 0,
            times: [ 0 ],
            figure: {
                x_range: { start: 0, end: 1e6 },
                y_range: { start: 0, end: 1e6 },
            },
            datasets: [
                {
                    active: {
                        "Bar": true
                    },
                    driver: "nearcast",
                    id: 0,
                    label: "Foo",
                    view: "tiled_image"
                }
            ]
        }
        expect(actual).toEqual(expected)
    })
    // Timeout to allow fetch useEffect hooks to resolve
    await waitFor(() => screen.getByText("Dimension: time"))
})
