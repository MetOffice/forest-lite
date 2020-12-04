import {
    SET_ACTIVE,
    SET_VISIBLE,
    TOGGLE_ACTIVE,
    SET_ONLY_ACTIVE,
    SET_STATE,
    SET_URL,
    SET_DATASET,
    SET_DATASETS,
    SET_DATASET_DESCRIPTION,
    SET_DATASET_COLORBAR,
    SET_FIGURE,
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
    GOTO_ITEM,
    NEXT_ITEM,
    PREVIOUS_ITEM,
    SET_ITEMS,
    PREVIOUS_TIME_INDEX,
    FETCH_IMAGE,
    FETCH_IMAGE_SUCCESS,
    SET_FLAG,
    TOGGLE_FLAG,
    UPDATE_NAVIGATE,
    ZOOM_IN,
    ZOOM_OUT
} from "./action-types"

// Action creators
export const setVisible = payload => ({ type: SET_VISIBLE, payload })
export const setActive = payload => ({ type: SET_ACTIVE, payload })
export const setOnlyActive = payload => ({ type: SET_ONLY_ACTIVE, payload })
export const toggleActive = payload => ({ type: TOGGLE_ACTIVE, payload })
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

export const setFigure = props => ({ type: SET_FIGURE, payload: props })
export const setState = props => ({ type: SET_STATE, payload: props })

export const setColorbar = flag => setFlag({colorbar: flag})
export const setContours = flag => setFlag({contours: flag})
export const setHoverTool = flag => setFlag({hover_tool: flag})
export const setFlag = payload => ({ type: SET_FLAG, payload: payload })

export const toggleColorbar = () => toggleFlag("colorbar")
export const toggleContours = () => toggleFlag("contours")
export const toggleHoverTool = () => toggleFlag("hover_tool")
export const toggleFlag = (prop, initial=false) => ({
    type: TOGGLE_FLAG,
    payload: {prop, initial}
})


// Dataset meta-data
export const setDatasetDescription = (datasetId, data) => {
    return { type: SET_DATASET_DESCRIPTION, payload: { datasetId, data } }
}

// Dataset colorbar
export const setDatasetColorbar = (datasetId, data) => {
    return { type: SET_DATASET_COLORBAR, payload: { datasetId, data } }
}

// Navigation actions
export const nextItem = path => ({ type: NEXT_ITEM, payload: { path } })
export const previousItem = path => ({ type: PREVIOUS_ITEM, payload: { path } })
export const setItems = (path, items) => {
    return {
        type: SET_ITEMS,
        payload: { path, items }
    }
}
export const goToItem = (path, item) => {
    return {
        type: GOTO_ITEM,
        payload: { path, item }
    }
}
export const updateNavigate = payload => ({ type: UPDATE_NAVIGATE, payload })

// Zoom control actions
export const zoomIn = () => ({ type: ZOOM_IN })
export const zoomOut = () => ({ type: ZOOM_OUT })
