import {
    SET_URL,
    SET_DATASET,
    SET_DATASETS,
    SET_PALETTE,
    SET_PALETTES,
    SET_PALETTE_NAME,
    SET_PALETTE_NAMES,
    SET_PALETTE_NUMBER,
    SET_PALETTE_NUMBERS,
    SET_PLAYING,
    SET_LIMITS,
    SET_TIMES,
    SET_TIME_INDEX,
    NEXT_TIME_INDEX,
    PREVIOUS_TIME_INDEX,
    FETCH_IMAGE,
    FETCH_IMAGE_SUCCESS,
    SET_COLORBAR,
    TOGGLE_COLORBAR,
    SET_HOVER_TOOL,
    TOGGLE_HOVER_TOOL,
} from "./action-types"

// Action creators
export const set_url = url => { return { type: SET_URL, payload: url } }
export const set_dataset = name => { return { type: SET_DATASET, payload: name } }
export const set_datasets = names => { return { type: SET_DATASETS, payload: names } }
export const set_palette = name => { return { type: SET_PALETTE, payload: name } }
export const set_palettes = items => { return { type: SET_PALETTES, payload: items } }
export const set_palette_name = data => { return { type: SET_PALETTE_NAME, payload: data } }
export const set_palette_names = data => { return { type: SET_PALETTE_NAMES, payload: data } }
export const set_palette_number = data => { return { type: SET_PALETTE_NUMBER, payload: data } }
export const set_palette_numbers = data => { return { type: SET_PALETTE_NUMBERS, payload: data } }
export const set_playing = flag => { return { type: SET_PLAYING, payload: flag } }
export const set_limits = limits => { return { type: SET_LIMITS, payload: limits } }
export const set_times = times => { return { type: SET_TIMES, payload: times } }
export const set_time_index = index => { return { type: SET_TIME_INDEX, payload: index } }
export const next_time_index = () => { return { type: NEXT_TIME_INDEX } }
export const previous_time_index = () => { return { type: PREVIOUS_TIME_INDEX } }
export const fetch_image = url => { return { type: FETCH_IMAGE, payload: url } }
export const fetch_image_success = () => { return { type: FETCH_IMAGE_SUCCESS } }

export const setColorbar = (flag) => {
    return { type: SET_COLORBAR, payload: flag }
}

export const toggleColorbar = () => {
    return { type: TOGGLE_COLORBAR }
}

export const setHoverTool = (flag) => {
    return { type: SET_HOVER_TOOL, payload: flag }
}

export const toggleHoverTool = () => {
    return { type: TOGGLE_HOVER_TOOL }
}
