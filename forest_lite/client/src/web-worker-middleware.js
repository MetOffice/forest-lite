/**
 * Wiring between React-Redux app and dedicated web worker
 */
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import {
    GOT_INDEXEDDB_NATURAL_EARTH_FEATURE,
    SET_HTTP_NATURAL_EARTH_FEATURE,
    SET_QUADKEYS
} from "./action-types.js"
import {
    getIndexedDBNaturalEarthFeature,
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
        // Query Indexed DB
        payload.map(quadkey => {
            const feature = "coastlines"
            const action = getIndexedDBNaturalEarthFeature({ quadkey, feature })
            worker.postMessage(action)
        })
    }
    if (type === GOT_INDEXEDDB_NATURAL_EARTH_FEATURE) {
        const { status, quadkey, feature } = payload
        if (status === "FAIL") {
            const ports = selectPorts(store.getState())
            if (ports !== null) {
                // Send action to Elm
                const action = getHttpNaturalEarthFeature({ quadkey, feature })
                ports.receiveData.send({ label: "action", payload: action })
            }
        } else if (status === "SUCCEED") {
            // Send action to Redux app
            return next(setNaturalEarthFeature(payload))
        }
    }
    return next(action)
}
