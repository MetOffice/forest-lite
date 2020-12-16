import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { ToggleButton } from "../src/buttons"


test("ToggleButton", () => {
    const name = "limits"
    const choices = [ "auto", "manual" ]
    const onChange = jest.fn()
    render(<ToggleButton
                name={ name }
                onChange={ onChange }
                choices={ choices } />)
    expect(screen.getByText(/auto/i)).toBeInTheDocument()

    // Click "manual" option
    fireEvent.click(screen.getByText(/manual/i))

    expect(onChange.mock.calls.length).toEqual(1)
    expect(onChange.mock.calls[0][0]).toEqual("manual")

    // Test toggle behaviour
    fireEvent.click(screen.getByText(/auto/i))

    expect(screen.getByRole("radio", { name: /auto/i })).toBeChecked()
    expect(screen.getByRole("radio", { name: /manual/i })).not.toBeChecked()
})
