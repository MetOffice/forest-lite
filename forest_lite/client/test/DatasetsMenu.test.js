import React from "react"
import { Provider } from "react-redux"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import DatasetsMenu from "../src/DatasetsMenu.js"
import { createStore } from "../src/create-store.js"


test("DatasetsMenu", () => {
    const store = createStore()
    render(
        <Provider store={ store } >
            <DatasetsMenu />
        </Provider>
    )
    expect(screen.getByText(/dataset/i)).toBeInTheDocument()
    expect(screen.getByText(/please select/i)).toBeInTheDocument()
})
