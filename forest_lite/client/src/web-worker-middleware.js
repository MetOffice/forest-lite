/**
 * Wiring between React-Redux app and dedicated web worker
 */
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import {
    SET_NATURAL_EARTH_FEATURE,
    SET_QUADKEYS
} from "./action-types.js"
import Worker from "./web-worker.js"


const worker = new Worker()


// React component to connect web-worker to React store
export const WebWorker = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        // Receive messages from worker
        worker.onmessage = ({ data }) => {
            dispatch(data)
        }
    }, [])
    return null
}


// Send messages to worker
export const webWorkerMiddleware = store => next => action => {
    const { type } = action
    if (type === SET_NATURAL_EARTH_FEATURE) {
        // Send action to web worker
        worker.postMessage(action)
    }
    if (type === SET_QUADKEYS) {
        console.log("web-worker-middleware", action)
    }
    return next(action)
}
