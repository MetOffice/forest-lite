import React from "react"
import { Provider } from "react-redux"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { setState } from "../src/actions.js"
import { createStore } from "../src/create-store.js"
import Colorbar, { ColorbarTitle, ColorbarPenButton, mapStateToProps } from "../src/Colorbar.js"


test("Colorbar", async () => {
    const store = createStore()
    const datasetId = 0
    const state = {
        datasets: [
            {
                id: datasetId,
                description: {
                    data_vars: {
                        variable: {
                            attrs: {
                                long_name: "Long name",
                                units: "unit"
                            }
                        }
                    }
                },
                active: {
                    variable: true
                }
            }
        ]
    }
    store.dispatch(setState(state))
    expect(store.getState()).toEqual(state)
    const el = document.createElement("div")
    render(
        <Provider store={ store } >
            <Colorbar el={ el } datasetId={ datasetId } />
        </Provider>, {
            container: document.body.appendChild(el)
        }
    )
    await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    // Click edit button
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))

    // Check edit options available
    expect(screen.getByText(/colorbar options/i)).toBeInTheDocument()
})


test("ColorbarTitle", async () => {
    const store = createStore()
    const datasetId = 0
    const state = {
        datasets: [
            {
                id: datasetId,
                description: {
                    data_vars: {
                        variable: {
                            attrs: {
                                long_name: "Long name",
                                units: "unit"
                            }
                        }
                    }
                },
                active: {
                    variable: true
                }
            }
        ]
    }

    // Fake application state
    store.dispatch(setState(state))
    expect(store.getState()).toEqual(state)

    const colorbar = { title: "" }
    render(
        <Provider store={ store } >
            <ColorbarTitle colorbar={ colorbar } datasetId={ datasetId } />
        </Provider>
    )

    // Async behaviour
    await waitFor(() => {
        return colorbar.title != ""
    })

    // Check title rendered correctly
    const actual = colorbar.title
    const expected = "Long name [unit]"
    expect(actual).toEqual(expected)
})


test("ColorbarPenButton", async () => {
    const onClick = jest.fn()
    render(
        <ColorbarPenButton onClick={ onClick } />
    )
    const pen = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(pen)
    expect(pen).toBeInTheDocument()
    expect(onClick.mock.calls.length).toEqual(1)
})


test("mapStateToProps", () => {
    const state = {}
    const ownProps = { datasetId: 0 }
    const actual = mapStateToProps(state, ownProps)
    const expected = {
        limits: { low: 0, high: 1 },
        palette: [],
        visible: false
    }
    expect(actual).toEqual(expected)
})


test("mapStateToProps given active dataset", () => {
    const state = {
        datasets: [
            {
                id: 0,
                active: {
                    variable: true
                }
            }
        ]
    }
    const ownProps = { datasetId: 0 }
    const actual = mapStateToProps(state, ownProps)
    const expected = {
        limits: { low: 0, high: 1 },
        palette: [],
        visible: true
    }
    expect(actual).toEqual(expected)
})
