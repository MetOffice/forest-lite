import { NEXT_TIME_INDEX, PREVIOUS_TIME_INDEX } from "./action-types.js"
import { nextItem, previousItem } from "./actions.js"
import {
    compose,
    defaultTo,
    view,
    lensPath,
    head,
    filter,
    prop,
    keys,
    identity,
    map
} from "ramda"


const getDatasets = compose(defaultTo([]), prop("datasets"))
const getActive = compose(defaultTo({}), prop("active"))
const activeDataVars = compose(keys, filter(identity))


const selectNameVar = state => {
    const datasets = getDatasets(state)
    const dataVars = map(compose(activeDataVars, getActive))(datasets)
    const names = map(prop("label"))(datasets)
    for (let i=0; i<datasets.length; i++) {
        if (dataVars[i].length > 0) {
            return [ names[i], dataVars[i][0] ]
        }
    }
}

const isTime = x => x.startsWith("time")

const selectTimeDim = (state, datasetName, dataVar) => {
    const path = ["navigate", datasetName, dataVar]
    const dims = Object.keys(view(lensPath(path), state))
    return head(filter(isTime, dims))
}

export const navMiddleware = store => next => action => {
    const { navigate = null, datasets } = store.getState()
    if (navigate == null) return next(action)

    const { type, payload } = action

    // TODO: Switch to an easier to parse data-structure
    const state = store.getState()
    const [ name, dataVar ] = selectNameVar(state)
    const dim = selectTimeDim(state, name, dataVar)
    const path = ["navigate", name, dataVar, dim]

    switch (type) {
        case NEXT_TIME_INDEX:
            return next(nextItem(path))
        case PREVIOUS_TIME_INDEX:
            return next(previousItem(path))
        default:
            return next(action)
    }
}
