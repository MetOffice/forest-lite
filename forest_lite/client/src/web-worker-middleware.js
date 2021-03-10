/**
 * Wiring between React-Redux app and dedicated web worker
 */
import { SET_NATURAL_EARTH_FEATURE } from "./action-types.js"
import Worker from "./web-worker.js"


const worker = new Worker()


export const webWorkerMiddleware = store => next => action => {
    const { type } = action
    if (type === SET_NATURAL_EARTH_FEATURE) {
        // Send action to web worker
        worker.postMessage(action)
    }
    return next(action)
}
