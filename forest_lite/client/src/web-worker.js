/**
 * Web worker to perform off-main thread tasks
 */


// IndexedDB set up
const version = 1
const dbName = "forest-lite"
const request = indexedDB.open(dbName, version)
request.onerror = ev => {
    console.log("error")
}
request.onsuccess = ev => {
    console.log("success")
}
request.onupgradeneeded = ev => {
    const db = ev.target.result
    const objectStore = db.createObjectStore("natural_earth_feature",
                                             { keyPath: ["feature", "quadkey"]})

    objectStore.createIndex("feature", "feature", { unique: false })

    objectStore.createIndex("quadkey", "quadkey", { unique: false })

    objectStore.transaction.oncomplete = ev => {
        console.log("upgrade complete")
    }
}

/**
 * Receive messages from main thread
 */
onmessage = ({ data }) => {
    const { type, payload } = data

    // Add an entry to IndexedDB
    const request = indexedDB.open(dbName, version)
    request.onsuccess = ev => {
        const db = ev.target.result
        const transaction = db.transaction([ "natural_earth_feature" ], "readwrite")
        const objectStore = transaction.objectStore("natural_earth_feature")
        const request = objectStore.add(payload)
        request.onerror = ev => {
            console.log("failed to add record")
        }
        request.onsuccess = ev => {
            console.log("successfully added record")
        }
    }
}
