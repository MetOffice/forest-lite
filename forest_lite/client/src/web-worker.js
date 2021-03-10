/**
 * Web worker to perform off-main thread tasks
 */
onmessage = ({ data }) => {
    const { type, payload } = data
    console.log("worker.js", payload)
}
