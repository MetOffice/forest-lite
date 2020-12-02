import React from "react"
import { Provider } from "react-redux"
import { selectDatasets, selectActive, isLonLatDim } from "../src/Nav.js"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { act } from "react-dom/test-utils"
import { NavPanel } from "../src/Nav.js"
import { createStore } from "../src/create-store.js"
import { updateNavigate } from "../src/actions.js"
import { server } from "./server.js"


beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())


test("selectDatasets", () => {
    const actual = selectDatasets({})
    const expected = []
    expect(actual).toEqual(expected)
})


test("selectDatasets given realistic data", () => {
    const content = [
        {key: "value"}
    ]
    const actual = selectDatasets({ datasets: content })
    const expected = content
    expect(actual).toEqual(expected)
})


test("selectActive", () => {
    const dataset = {
        label: "Label",
        datasetId: 42,
        active: { foo: false, bar: true }
    }
    const actual = selectActive({ datasets: [
        dataset
    ] })
    const expected = [
        {
            label: "Label",
            id: 42,
            dataVar: "bar"
        }
    ]
    expect(actual).toEqual(expected)
})


test("Check fetch polyfill and msw", () => {
    const expected = {
        data: [ 0 ],
        attrs: {
            standard_name: "time"
        }
    }
    fetch("/base/endpoint")
        .then(response => response.json())
        .then(actual => {
            expect(actual).toEqual(expected)
        })
})

// TODO: Update test to check latest behaviour
test.skip("NavPanel", async () => {
    const store = createStore()

    // Fake data
    const datasetName = "Foo"
    const dataVar = "Bar"
    const datasets = [
        {
            label: datasetName,
            id: 0,
            description: {
                data_vars: {
                    Bar: {
                        dims: ["time", "level"]
                    }
                }
            }
        }
    ]

    // Asynchronous act() to resolve promises
    await act(async () => {
        await render(
            <Provider store={ store } >
                <NavPanel
                    baseURL="/base"
                    datasets={ datasets }
                    datasetName={ datasetName }
                    dataVar={ dataVar } />
            </Provider>
        )
    })

    // Wait for initial renders to complete
    await waitFor(() => screen.getByText("Dimension: time"))

    // Check select labels are correct
    expect(screen.getByText("Dimension: time"))
        .toBeInTheDocument()
    expect(screen.getByText("Dimension: level"))
        .toBeInTheDocument()

    // Click first select menu
    fireEvent.change(screen.getAllByTestId("select")[0], {
        target: { value: "1970-01-01T00:00:00Z" }
    })

    // Check effect on application state
    const actual = store.getState()
    const expected = {
        navigate: {
            Foo: {
                Bar: {
                    time: {
                        before: [],
                        current: "1970-01-01T00:00:00Z",
                        after: []
                    }
                }
            }
        }
    }
    expect(actual).toEqual(expected)
})


// TODO: Update test to check latest behaviour
test.skip("NavPanel renders application state", async () => {
    // Set up application state
    const store = createStore()
    const action = updateNavigate({
        datasetName: "Foo",
        dataVar: "Bar",
        dimension: "time",
        value: "1970-01-01T00:00:00Z"
    })

    // Fake data
    const datasetName = "Foo"
    const dataVar = "Bar"
    const datasets = [
        {
            label: datasetName,
            id: 0,
            description: {
                data_vars: {
                    Bar: {
                        dims: ["time", "level"]
                    }
                }
            }
        }
    ]
    const point = {
        time: "1970-01-01T00:00:00Z",
        level: null
    }

    // Render component
    await act(async () => {
        render(
            <Provider store={ store } >
                <NavPanel
                    baseURL="base"
                    datasets={ datasets }
                    datasetName={ datasetName }
                    dataVar={ dataVar }
                    point={ point } />
            </Provider>
        )
        // Update store after component render
        store.dispatch(action)
    })

    // Wait for initial renders to complete
    await waitFor(() => screen.getByText(/dimension: time/i))


    // Check select values are set correctly
    expect(screen.getByDisplayValue(/1970/i)).toBeInTheDocument()
})


test.each`
  dimName | expected
  ${ "time" } | ${ false }
  ${ "pressure" } | ${ false }
  ${ "longitude" } | ${ true }
  ${ "latitude" } | ${ true }
  ${ "latitude_0" } | ${ true }
  ${ "longitude_0" } | ${ true }
  ${ "grid_latitude" } | ${ true }
  ${ "grid_longitude" } | ${ true }
`("isLonLatDim($dimName) === $expected", ({ dimName, expected }) => {
    expect(isLonLatDim(dimName)).toEqual(expected)
})
