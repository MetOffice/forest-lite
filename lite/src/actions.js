import {
    SET_HOVER_TOOL,
    TOGGLE_HOVER_TOOL,
} from "./action-types"


export const setHoverTool = (flag) => {
    return { type: SET_HOVER_TOOL, payload: flag }
}

export const toggleHoverTool = () => {
    return { type: TOGGLE_HOVER_TOOL }
}
