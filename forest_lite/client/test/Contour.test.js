import React from "react"
import { Provider } from "react-redux"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { createStore } from "../src/create-store.js"
import * as Bokeh from "@bokeh/bokehjs"
import Contours from "../src/Contours.js"


test("Contours", () => {
    const store = createStore()
    const figure = Bokeh.Plotting.figure()
    render(
        <Provider store={ store } >
            <Contours figure={ figure } />
        </Provider>
    )
})
