import React from "react"
import { Provider } from "react-redux"
import { selectDatasets, selectActive } from "../src/Nav.js"
import { render, unmountComponentAtNode } from "react-dom"
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


beforeAll(() => {
})

let container = null
beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
})


afterEach(() => {
    unmountComponentAtNode(container)
    container.remove()
    container = null
})


test("NavPanel", async () => {

    // Fake fetch API
    let urls = []
    window.fetch = jest.fn().mockImplementation(url => {
        urls.push(url)
        return Promise.resolve({
            json: () => Promise.resolve({
                data: [0],
                attrs: {
                    standard_name: "time"
                }
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
            <NavPanel
                baseURL="base"
                datasets={ datasets }
                datasetName={ datasetName }
                dataVar={ dataVar } />
            , container)
    })

    // expect(container.textContent).toEqual("")
    expect(urls).toEqual([
        "base/datasets/0/Bar/axis/time",
        "base/datasets/0/Bar/axis/level"
    ])

    // Restore original fetch function
    window.fetch.mockClear()
    delete window.fetch
})
