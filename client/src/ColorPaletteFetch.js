import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import {
    set_palettes,
    set_palette_number,
    set_palette_name,
    set_palette_names,
} from "./actions.js"



const ColorPaletteFetch = props => {
    const { baseURL } = props
    const dispatch = useDispatch()
    useEffect(() => {
        // Async get palette names
        fetch(`${baseURL}/palettes`)
            .then((response) => response.json())
            .then((data) => {
                let action = set_palettes(data)
                dispatch(action)
                return data
            })
            .then((data) => {
                let names = data.map((p) => p.name)
                return Array.from(new Set(names)).concat().sort()
            })
            .then((names) => {
                let action = set_palette_names(names)
                dispatch(action)
            })
    }, [])
    return null
}

export default ColorPaletteFetch
