/**
 * Reducers combine state and actions to produce new state
 */
import {
    SET_ACTIVE,
    TOGGLE_ACTIVE,
    SET_ONLY_ACTIVE,
    SET_FLAG,
    SET_FIGURE,
    SET_DATASET,
    SET_DATASETS,
    SET_DATASET_DESCRIPTION,
    SET_DATASET_COLORBAR,
    SET_URL,
    SET_PALETTE,
    SET_PALETTES,
    SET_PALETTE_NAME,
    SET_PALETTE_NAMES,
    SET_PALETTE_NUMBER,
    SET_PALETTE_NUMBERS,
    SET_PLAYING,
    SET_LIMITS,
    SET_STATE,
    SET_TIMES,
    SET_TIME_INDEX,
    UPDATE_NAVIGATE,
    FETCH_IMAGE,
    FETCH_IMAGE_SUCCESS
} from "./action-types.js"
import * as R from "ramda"
import {
    F,
    defaultTo,
    identity,
    compose,
    pipe,
    lensProp,
    lensPath,
    set,
    over,
    map,
    mapObjIndexed,
    not
} from "ramda"


const activeReducer = (state, action) => {
    const { id, flag } = action.payload
    const fn = R.ifElse(
        R.propEq("id", id),
        R.assoc("active", flag),
        R.identity
    )
    return R.evolve({ datasets: R.map(fn) })(state)
}

const onlyActiveReducer = (state, action) => {
    // Mark all false except payload
    const { payload } = action
    const { dataset: datasetName, data_var: dataVar } = payload
    const updateDataset = dataset => {
        const { active={}, label=null } = dataset
        let flags = mapObjIndexed(F)(active)
        if (label != null) {
            flags[dataVar] = (label === datasetName)
        }
        return set(lensProp("active"), flags, dataset)
    }
    return over(lensProp("datasets"), pipe(
        defaultTo([]),
        map(updateDataset)
    ), state)
}


export const toggleActiveReducer = (state, action) => {
    // Update state.datasets[datasetId].active[dataVar]
    const { payload } = action
    const { dataset, data_var } = payload

    // Choose reduction algorithm
    const behaviour = "radio"
    let editActive
    if (behaviour === "radio") {
        // Radio select logic
        const isDataVar = (value, key) => {
            if (key === data_var) {
                return value
            } else {
                return false
            }
        }
        const updateActive = compose(
            over(lensProp("active"), mapObjIndexed(isDataVar)),
            over(lensPath(["active", data_var]), not),
        )
        editActive = R.ifElse(
            R.propEq("label", dataset),
            updateActive,
            R.identity
        )

    } else {
        // Multi-select logic
        editActive = R.ifElse(
            R.propEq("label", dataset),
            R.over(R.lensPath(["active", data_var]), R.not),
            R.identity
        )
    }
    const datasetsLens = lensProp("datasets")
    return over(datasetsLens, map(editActive), state)
}


export const rootReducer = (state = "", action) => {
    const { type, payload } = action
    switch (type) {
        case SET_ACTIVE:
            return activeReducer(state, action)
        case SET_ONLY_ACTIVE:
            return onlyActiveReducer(state, action)
        case TOGGLE_ACTIVE:
            return toggleActiveReducer(state, action)
        case SET_FLAG:
            return Object.assign({}, state, payload)
        case SET_FIGURE:
            return Object.assign({}, state, {figure: payload})
        case SET_DATASET:
            return Object.assign({}, state, {dataset: payload})
        case SET_DATASET_DESCRIPTION:
            return datasetIdReducer("description")(state, action)
        case SET_DATASET_COLORBAR:
            return datasetIdReducer("colorbar")(state, action)
        case SET_DATASETS:
            return Object.assign({}, state, {datasets: payload})
        case SET_URL:
            return Object.assign({}, state, {url: payload})
        case SET_PALETTE:
            return Object.assign({}, state, {palette: payload})
        case SET_PALETTES:
            return Object.assign({}, state, {palettes: payload})
        case SET_PALETTE_NAME:
            return Object.assign({}, state, {palette_name: payload})
        case SET_PALETTE_NAMES:
            return Object.assign({}, state, {palette_names: payload})
        case SET_PALETTE_NUMBER:
            return Object.assign({}, state, {palette_number: payload})
        case SET_PALETTE_NUMBERS:
            return Object.assign({}, state, {palette_numbers: payload})
        case SET_PLAYING:
            return Object.assign({}, state, {playing: payload})
        case SET_LIMITS:
            return setLimitsReducer(state, action)
        case SET_STATE:
            return R.clone(payload)
        case SET_TIMES:
            return Object.assign({}, state, {times: payload})
        case SET_TIME_INDEX:
            return Object.assign({}, state, {time_index: payload})
        case FETCH_IMAGE:
            return Object.assign({}, state, {is_fetching: true, image_url: payload})
        case FETCH_IMAGE_SUCCESS:
            return Object.assign({}, state, {is_fetching: false})
        case UPDATE_NAVIGATE:
            return navigateReducer(state, action)
        default:
            return state
    }
}


const datasetIdReducer = prop => (state, action) => {
    const { type, payload } = action
    const { datasets=[] } = state
    const { datasetId, data } = payload
    const updatedDatasets = datasets.map(dataset => {
        if (dataset.id === datasetId) {
            let update = {}
            update[prop] = data
            return Object.assign({}, dataset, update)
        }
        return dataset
    })
    return Object.assign({}, state, { datasets: updatedDatasets })
}


const setLimitsReducer = (state, action) => {
    const { payload } = action
    const { low, high, path = [] } = payload
    const limitsLens = compose(lensProp("limits"), lensPath(path))
    return set(limitsLens, {low, high}, state)
}


/**
 * Manage application navigation state
 */
const navigateReducer = (state, action) => {
    const { type, payload } = action
    switch (type) {
        case UPDATE_NAVIGATE:
            const { datasetName, dataVar, dimension, value } = payload
            const path = ["navigate", datasetName, dataVar, dimension]
            return set(lensPath(path), value, state)
        default:
            return state
    }
}
