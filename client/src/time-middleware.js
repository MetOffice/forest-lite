import { SET_TIMES } from "./action-types.js"
import { set_time_index } from "./actions.js"


export const timeMiddleware = store => next => action => {
    const { type, payload } = action
    const { time_index } = store.getState()
    if (type === SET_TIMES) {
        if (typeof time_index === "undefined") {
            next(set_time_index(0))
        }
    }
    next(action)
}
