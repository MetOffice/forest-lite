import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import Select from "../src/Select.js"


test("Select", () => {
    const items = ["foo", "bar"]
    const callback = jest.fn()

    // Render component
    render(<Select values={ items } callback={ callback } />)

    // Check select element in document
    expect(screen.getByTestId("select")).toBeInTheDocument()

    // Simulate user click of option
    fireEvent.change(screen.getByTestId("select"), {
        target: { value: "foo" }
    })

    // Call callback with option value
    expect(callback.mock.calls.length).toBe(1)
    expect(callback.mock.calls[0][0]).toBe("foo")

})
