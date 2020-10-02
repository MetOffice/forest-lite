/**
 * Translate zoom in/out actions to set_figure
 */
import { ZOOM_IN, ZOOM_OUT } from "./action-types.js"
import { setFigure } from "./actions.js"


export const zoomMiddleware = store => next => action => {
    const { type, payload } = action
    const { figure } = store.getState()
    switch (type) {
        case ZOOM_IN:
            return next(setFigure(zoomInOneLevel(figure)))
        case ZOOM_OUT:
            return next(setFigure(zoomOutOneLevel(figure)))
        default:
            return next(action)
    }
}


export const zoomInOneLevel = figure => {
    const { x_range, y_range } = figure
    return {
        x_range: half(x_range),
        y_range: half(y_range)
    }
}
export const zoomOutOneLevel = figure => {
    const { x_range, y_range } = figure
    return {
        x_range: twice(x_range),
        y_range: twice(y_range)
    }
}


const half = ({ start, end }) => {
    const center = (start + end) / 2
    const width = end - start
    return {
        start: center - (width / 4),
        end: center + (width / 4)
    }
}


const twice = ({ start, end }) => {
    const center = (start + end) / 2
    const width = end - start
    return {
        start: center - width,
        end: center + width
    }
}
