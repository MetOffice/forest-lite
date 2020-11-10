import * as Redux from "redux"
import { rootReducer } from "./reducers.js"
import { animationMiddleware } from "./animation-middleware.js"
import { colorPaletteMiddleware } from "./colorpalette-middleware.js"
import { timeMiddleware } from "./time-middleware.js"
import { toolMiddleware } from "./middlewares.js"
import { zoomMiddleware } from "./zoom-middleware.js"
import {
    SET_DATASETS,
} from "./action-types.js"
import {
    set_dataset,
} from "./actions.js"


// Middlewares
let logActionMiddleware = store => next => action => {
    console.log(action)
    next(action)
}


let datasetsMiddleware = store => next => action => {
    next(action)
    if (action.type == SET_DATASETS) {
        const { dataset } = store.getState()
        if (typeof dataset !== "undefined") {
            let dataset_id = action.payload[0].id
            next(set_dataset(dataset_id))
        }
    }
    return
}


export const createStore = ({ log=false } = {}) => {
    let middlewares = []
    if (log) {
        // Optional: log actions as they flow through reducer
        middlewares.push(logActionMiddleware)
    }
    middlewares = middlewares.concat([
            toolMiddleware,
            animationMiddleware,
            colorPaletteMiddleware,
            timeMiddleware,
            datasetsMiddleware,
            zoomMiddleware
    ])
    return Redux.createStore(rootReducer, Redux.applyMiddleware(...middlewares))
}
