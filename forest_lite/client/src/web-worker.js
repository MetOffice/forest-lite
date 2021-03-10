/**
 * Web worker to perform off-main thread tasks
 */
import {
    SET_HTTP_NATURAL_EARTH_FEATURE,
    GET_INDEXEDDB_NATURAL_EARTH_FEATURE
} from "./action-types.js"
import {
    gotIndexedDBNaturalEarthFeature
} from "./actions.js"


// Message creators
const log = msg => ({ type: "LOG", payload: msg })

// Database definition
const version = 1
const dbName = "forest-lite"
const storeName = "natural_earth_feature"


if (indexedDB) {
    // IndexedDB set up
    const request = indexedDB.open(dbName, version)
    request.onerror = ev => {
        postMessage(log("error"))
    }
    request.onsuccess = ev => {
        postMessage(log("success"))
    }
    request.onupgradeneeded = ev => {
        const db = ev.target.result
        const objectStore = db.createObjectStore(storeName,
                                                 { keyPath: ["feature", "quadkey"]})

        objectStore.createIndex("feature", "feature", { unique: false })

        objectStore.createIndex("quadkey", "quadkey", { unique: false })

        objectStore.transaction.oncomplete = ev => {
            postMessage(log("upgrade complete"))
        }
    }
}

/**
 * Receive messages from main thread
 */
onmessage = ({ data }) => {
    const { type, payload } = data

    // Add an entry to IndexedDB
    if (type === SET_HTTP_NATURAL_EARTH_FEATURE) {
        saveNaturalEarthFeature(payload)
    } else if (type === GET_INDEXEDDB_NATURAL_EARTH_FEATURE) {
        getNaturalEarthFeature(payload)
    }

}


const getNaturalEarthFeature = payload => {
    const { feature, quadkey } = payload
    // TODO: Query IndexedDB for feature/quadkey record
    if (indexedDB) {
        const request = indexedDB.open(dbName, version)
        request.onsuccess = ev => {
            const db = ev.target.result
            const transaction = db.transaction([ storeName ], "readwrite")
            const objectStore = transaction.objectStore(storeName)
            const getRequest = objectStore.get([ feature, quadkey ])
            getRequest.onerror = ev => {
                const payload = { status: "FAIL", feature, quadkey }
                postMessage(gotIndexedDBNaturalEarthFeature(payload))
            }
            getRequest.onsuccess = ev => {
                const result = ev.target.result
                const status = validate(result) ? "SUCCESS" : "FAIL"
                const payload = Object.assign({}, result, { status, feature, quadkey })
                postMessage(gotIndexedDBNaturalEarthFeature(payload))
            }
        }
    } else {
        // IndexedDB not available
        const action = gotIndexedDBNaturalEarthFeature({
            status: "FAIL",
            feature,
            quadkey
        })
        postMessage(action)
    }
}


const validate = result => {
    return (result !== undefined) && (result.data !== undefined)
}


// Save MultiLine data to IndexedDB
const saveNaturalEarthFeature = payload => {
    if (indexedDB) {
        const request = indexedDB.open(dbName, version)
        request.onsuccess = ev => {
            const db = ev.target.result
            const transaction = db.transaction([ storeName ], "readwrite")
            const objectStore = transaction.objectStore(storeName)
            const request = objectStore.add(payload)
            request.onerror = ev => {
                postMessage(log("failed to add record"))
            }
            request.onsuccess = ev => {
                postMessage(log("successfully added record"))
            }
        }
    }
}
