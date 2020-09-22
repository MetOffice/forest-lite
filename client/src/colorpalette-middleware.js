import {
    SET_PALETTE_NAME,
    SET_PALETTE_NUMBER,
    SET_PALETTES
} from "./action-types.js"
import {
    set_palette,
    set_palettes,
    set_palette_name,
    set_palette_names,
    set_palette_number,
    set_palette_numbers
} from "./actions.js"


/**
 * Business logic governing color palette selection
 */
export const colorPaletteMiddleware = store => next => action => {
    if (action.type == SET_PALETTE_NAME) {
        // Async get palette numbers
        let name = action.payload
        let state = store.getState()
        if (typeof state.palettes !== "undefined") {
            let numbers = state.palettes
                .filter((p) => p.name == name)
                .map((p) => parseInt(p.number))
                .concat()
                .sort((a, b) => a - b)
            let action = set_palette_numbers(numbers)
            store.dispatch(action)
        }
    }
    else if (action.type == SET_PALETTE_NUMBER) {
        // Async get palette numbers
        let state = store.getState()
        let name = state.palette_name
        let number = action.payload
        if (typeof state.palettes !== "undefined") {
            let palettes = getPalettes(state.palettes, name, number)
            if (palettes.length > 0) {
                let action = set_palette(palettes[0].palette)
                store.dispatch(action)
            }
        }
    }
    else if (action.type == SET_PALETTES) {
        // Set initial palette to Blues 256
        next(action)
        next(set_palette_name("Blues"))
        next(set_palette_number(256))
        let palettes = getPalettes(action.payload, "Blues", 256)
        if (palettes.length > 0) {
            let action = set_palette(palettes[0].palette)
            next(action)
        }
        return
    }

    return next(action)
}

// Helper method
const getPalettes = function(palettes, name, number) {
    return palettes
        .filter((p) => p.name === name)
        .filter((p) => parseInt(p.number) === parseInt(number))
}
