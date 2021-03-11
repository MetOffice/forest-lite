/**
 * Wiring between React-Redux app and dedicated web worker
 */
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import {
    SET_HTTP_NATURAL_EARTH_FEATURE,
    SET_QUADKEYS
} from "./action-types.js"
import {
    getHttpNaturalEarthFeature,
    setNaturalEarthFeature
} from "./actions.js"
import { selectPorts } from "./ports-selector.js"
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
    const { type, payload } = action
    if (type === SET_HTTP_NATURAL_EARTH_FEATURE) {
        // Send action to web worker
        worker.postMessage(action)

        // Send action to Redux app
        return next(setNaturalEarthFeature(payload))
    }
    if (type === SET_QUADKEYS) {

        // Query Indexed DB or message Elm to send HTTP requests

        const ports = selectPorts(store.getState())
        payload.map(quadkey => {
            const feature = "coastlines"
            const action = getHttpNaturalEarthFeature({ quadkey, feature })
            if (ports !== null) {
                // Send action to Elm
                ports.receiveData.send({ label: "action", payload: action })
            }
        })
    }
    return next(action)
}
