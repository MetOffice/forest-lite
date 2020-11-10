import React from "react"
import { Provider } from "react-redux"
import { selectDatasets, selectActive } from "../src/Nav.js"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { act } from "react-dom/test-utils"
import { NavPanel } from "../src/Nav.js"
import { createStore } from "../src/create-store.js"


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


test("NavPanel", async () => {
    const store = createStore()

    // Fake fetch API
    let urls = []
    window.fetch = jest.fn().mockImplementation(url => {
        urls.push(url)
        const attrs = {
            standard_name: "time"
        }
        return Promise.resolve({
            json: () => Promise.resolve({
                data: [0],
                attrs: attrs
            })
        })
    })

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
        render(
            <Provider store={ store } >
                <NavPanel
                    baseURL="base"
                    datasets={ datasets }
                    datasetName={ datasetName }
                    dataVar={ dataVar } />
            </Provider>
        )
    })

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
                    time: "1970-01-01T00:00:00Z"
                }
            }
        }
    }
    expect(actual).toEqual(expected)

    // Check REST API was called correctly
    expect(urls).toEqual([
        "base/datasets/0/Bar/axis/time",
        "base/datasets/0/Bar/axis/level"
    ])

    // Restore original fetch function
    window.fetch.mockClear()
    delete window.fetch
})
