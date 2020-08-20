/**
 * Action converters, splitters, enhancers and filters
 */
import {
    TOGGLE_COLORBAR,
    TOGGLE_HOVER_TOOL
} from "./action-types.js"
import {
    setColorbar,
    setHoverTool
} from "./actions.js"


export const toolMiddleware = store => next => action => {
    if (action.type === TOGGLE_HOVER_TOOL) {
        let flag
        let state = store.getState()
        if (typeof state.hover_tool === "undefined") {
            flag = true
        } else {
            flag = !state.hover_tool
        }
        next(setHoverTool(flag))
    } else if (action.type === TOGGLE_COLORBAR) {
        let flag
        let state = store.getState()
        if (typeof state.colorbar === "undefined") {
            flag = true
        } else {
            flag = !state.colorbar
        }
        next(setColorbar(flag))
    } else {
        next(action)
    }
}
