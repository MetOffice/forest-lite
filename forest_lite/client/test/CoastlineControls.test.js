import React from "react"
import { Provider } from "react-redux"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import CoastlineMenu from "../src/CoastlineMenu.js"
import { createStore } from "../src/create-store.js"


test("CoastlineMenu checkbox click", () => {
    const store = createStore()
    render(
        <Provider store={ store } >
            <CoastlineMenu />
        </Provider>
    )

    // Default state
    expect(screen.getByText(/coastlines, borders and lakes/i)).toBeInTheDocument()
    expect(store.getState().coastlines).toBe(undefined)

    // Click checkbox
    fireEvent.click(screen.getByText("Coastlines"))
    expect(store.getState().coastlines).toBe(false)

    // Click checkbox again
    fireEvent.click(screen.getByText("Coastlines"))
    expect(store.getState().coastlines).toBe(true)
})

// TODO: Revisit this feature
test.skip("CoastlineMenu refresh button", () => {
    const store = createStore()
    render(
        <Provider store={ store } >
            <CoastlineMenu />
        </Provider>
    )
    expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument()
})
