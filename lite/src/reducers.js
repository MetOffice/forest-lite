/**
 * Reducers combine state and actions to produce new state
 */
import {
    SET_COLORBAR,
    SET_HOVER_TOOL,
    SET_DATASET,
    SET_DATASETS,
    SET_URL,
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
    FETCH_IMAGE,
    FETCH_IMAGE_SUCCESS
} from "./action-types.js"


export const rootReducer = (state = "", action) => {
    switch (action.type) {
        case SET_COLORBAR:
            return Object.assign({}, state, {colorbar: action.payload})
        case SET_HOVER_TOOL:
            return Object.assign({}, state, {hover_tool: action.payload})
        case SET_DATASET:
            return Object.assign({}, state, {dataset: action.payload})
        case SET_DATASETS:
            return Object.assign({}, state, {datasets: action.payload})
        case SET_URL:
            return Object.assign({}, state, {url: action.payload})
        case SET_PALETTE:
            return Object.assign({}, state, {palette: action.payload})
        case SET_PALETTES:
            return Object.assign({}, state, {palettes: action.payload})
        case SET_PALETTE_NAME:
            return Object.assign({}, state, {palette_name: action.payload})
        case SET_PALETTE_NAMES:
            return Object.assign({}, state, {palette_names: action.payload})
        case SET_PALETTE_NUMBER:
            return Object.assign({}, state, {palette_number: action.payload})
        case SET_PALETTE_NUMBERS:
            return Object.assign({}, state, {palette_numbers: action.payload})
        case SET_PLAYING:
            return Object.assign({}, state, {playing: action.payload})
        case SET_LIMITS:
            return Object.assign({}, state, {limits: action.payload})
        case SET_TIMES:
            return Object.assign({}, state, {times: action.payload})
        case SET_TIME_INDEX:
            return Object.assign({}, state, {time_index: action.payload})
        case FETCH_IMAGE:
            return Object.assign({}, state, {is_fetching: true, image_url: action.payload})
        case FETCH_IMAGE_SUCCESS:
            return Object.assign({}, state, {is_fetching: false})
        default:
            return state
    }
}
