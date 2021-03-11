/**
 * Web worker to perform off-main thread tasks
 */
import {
    SET_NATURAL_EARTH_FEATURE,
    GET_NATURAL_EARTH_FEATURE,
    GOT_NATURAL_EARTH_FEATURE
} from "./action-types.js"


// Message creators
const log = msg => ({ type: "LOG", payload: msg })
const gotFeature = payload => ({ type: GOT_NATURAL_EARTH_FEATURE, payload })


// IndexedDB set up
const version = 1
const dbName = "forest-lite"
const request = indexedDB.open(dbName, version)
request.onerror = ev => {
    postMessage(log("error"))
}
request.onsuccess = ev => {
    postMessage(log("success"))
}
request.onupgradeneeded = ev => {
    const db = ev.target.result
    const objectStore = db.createObjectStore("natural_earth_feature",
                                             { keyPath: ["feature", "quadkey"]})

    objectStore.createIndex("feature", "feature", { unique: false })

    objectStore.createIndex("quadkey", "quadkey", { unique: false })

    objectStore.transaction.oncomplete = ev => {
        postMessage(log("upgrade complete"))
    }
}

/**
 * Receive messages from main thread
 */
onmessage = ({ data }) => {
    const { type, payload } = data

    // Add an entry to IndexedDB
    if (type === SET_NATURAL_EARTH_FEATURE) {
        setNaturalEarthFeature(payload)
    } else if (type === GET_NATURAL_EARTH_FEATURE) {
        getNaturalEarthFeature(payload)
    }

}


const getNaturalEarthFeature = payload => {
    postMessage(gotNaturalEarthFeature({ status: "FAIL" }))
}


const setNaturalEarthFeature = payload => {
    const request = indexedDB.open(dbName, version)
    request.onsuccess = ev => {
        const db = ev.target.result
        const storeName = "natural_earth_feature"
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
