/**
 * Reducers combine state and actions to produce new state
 */
import {
    SET_ACTIVE,
    SET_OPACITY,
    SET_VISIBLE,
    TOGGLE_ACTIVE,
    SET_ONLY_ACTIVE,
    SET_FLAG,
    SET_FIGURE,
    UPDATE_NATURAL_EARTH_FEATURE,
    SET_COASTLINES_COLOR,
    SET_COASTLINES_WIDTH,
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
    SET_TIME_INDEX,
    UPDATE_NAVIGATE,
    GOTO_ITEM,
    NEXT_ITEM,
    PREVIOUS_ITEM,
    SET_ITEMS,
    FETCH_IMAGE,
    FETCH_IMAGE_SUCCESS,
    SET_PORTS,
    SET_QUADKEYS
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
import { goTo, moveBackward, moveForward, fromList } from "./zipper.js"


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
        case SET_OPACITY:
            return Object.assign({}, state, {opacity: payload})
        case SET_VISIBLE:
            return Object.assign({}, state, {visible: payload})
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
        case SET_TIME_INDEX:
            return Object.assign({}, state, {time_index: payload})
        case FETCH_IMAGE:
            return Object.assign({}, state, {is_fetching: true, image_url: payload})
        case FETCH_IMAGE_SUCCESS:
            return Object.assign({}, state, {is_fetching: false})
        case UPDATE_NAVIGATE:
        case GOTO_ITEM:
        case NEXT_ITEM:
        case PREVIOUS_ITEM:
        case SET_ITEMS:
            return navigateReducer(state, action)
        case SET_PORTS:
            return portsReducer(state, action)
        case SET_QUADKEYS:
            return quadkeysReducer(state, action)
        case UPDATE_NATURAL_EARTH_FEATURE:
        case SET_COASTLINES_COLOR:
        case SET_COASTLINES_WIDTH:
            return coastlinesReducer(state, action)
        default:
            return state
    }
}


/**
 * Elm interop reducer
 *
 * Assign ports object to state to allow components to communicate with Elm
 */
const portsReducer = (state, action) => {
    const { type, payload } = action
    if (type === SET_PORTS) {
        return Object.assign({}, state, { ports: payload })
    } else {
        return state
    }
}

/**
 * Quadkeys reducer
 *
 * Assign quadkeys array to state to simplify tiling
 */
const quadkeysReducer = (state, action) => {
    const { type, payload } = action
    let features = state.natural_earth_features || {}
    if (type === SET_QUADKEYS) {
        let data = payload.reduce((obj, key) => {
            obj[key] = features[key] || null
            return obj
        }, {})
        return Object.assign({}, state, { natural_earth_features: data })
    } else {
        return state
    }
}


/**
 * API coastlines reducer
 */
const coastlinesReducer = (state, action) => {
    const { type, payload } = action
    if (type === UPDATE_NATURAL_EARTH_FEATURE) {
        const { feature, quadkey, data } = payload

        let natural_earth_features = Object.assign({},
            state.natural_earth_features || {})

        if (!(quadkey in natural_earth_features)) {
            // NOTE: only modify data if quadkey has been set, e.g.
            //       use data structure to eliminate impossible states
            return state
        }
        if (natural_earth_features[quadkey] == null) {
            natural_earth_features[quadkey] = {}
        }
        natural_earth_features[quadkey][feature] = data

        return Object.assign({}, state, { natural_earth_features })

    } else if (type === SET_COASTLINES_COLOR) {
        return Object.assign({}, state, { coastlines_color: payload })
    } else if (type === SET_COASTLINES_WIDTH) {
        return Object.assign({}, state, { coastlines_width: payload })
    } else {
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
    let { path, items, item } = payload
    switch (type) {
        case UPDATE_NAVIGATE:
            const { datasetName, dataVar, dimension, value } = payload
            path = ["navigate", datasetName, dataVar, dimension]
            return set(lensPath(path), value, state)
        case GOTO_ITEM:
            return over(lensPath(path), goTo(item), state)
        case NEXT_ITEM:
            return over(lensPath(path), moveForward, state)
        case PREVIOUS_ITEM:
            return over(lensPath(path), moveBackward, state)
        case SET_ITEMS:
            return set(lensPath(path), fromList(items), state)
        default:
            return state
    }
}
