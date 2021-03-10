/**
 * Wiring between React-Redux app and dedicated web worker
 */
import Worker from "./web-worker.js"

const worker = new Worker()
console.log(worker)


export const webWorkerMiddleware = store => next => action => {

    // Send work to web worker
    worker.postMessage(null)

    return next(action)
}
