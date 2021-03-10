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
    updateNaturalEarthFeature
} from "./actions.js"
import { selectPorts } from "./ports-selector.js"
import { selectQuadkeys } from "./quadkeys-selector.js"
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
        return next(updateNaturalEarthFeature(payload))
    }
    if (type === SET_QUADKEYS) {
        const featureKeys = [
            "coastlines",
            "borders",
            "disputed",
            "lakes"
        ]
        const stateQuadkeys = selectQuadkeys(store.getState())

        // Query Indexed DB
        payload
            .filter(quadkey => {
                return stateQuadkeys.indexOf(quadkey) === -1
            })
            .map(quadkey => {
                featureKeys.map(feature => {
                    const dbAction = getIndexedDBNaturalEarthFeature({
                        quadkey, feature
                    })
                    worker.postMessage(dbAction)
                })
        })

        return next(action)
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
        } else if (status === "SUCCESS") {
            // Send action to Redux app
            return next(updateNaturalEarthFeature(payload))
        }
    }
    return next(action)
}
