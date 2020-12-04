import React from "react"
import { Provider } from "react-redux"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import ShowLayer from "../src/ShowLayer.js"
import { createStore } from "../src/create-store.js"


test("ShowLayer", () => {
    const store = createStore()
    render(
        <Provider store={ store } >
            <ShowLayer />
        </Provider>
    )
    expect(screen.getByRole('button', { name: /visible/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /visible/i }))

    const state = store.getState()
    expect(state.visible).toEqual(false)
})
