/**
 * Action converters, splitters, enhancers and filters
 */
import { TOGGLE_FLAG } from "./action-types.js"
import { setFlag } from "./actions.js"


export const toolMiddleware = store => next => action => {
    if (action.type === TOGGLE_FLAG) {
        let flag
        let { prop, initial = false } = action.payload
        let state = store.getState()
        if (typeof state[prop] === "undefined") {
            flag = initial
        } else {
            flag = state[prop]
        }
        let payload = {}
        payload[prop] = !flag
        next(setFlag(payload))
    } else {
        next(action)
    }
}
