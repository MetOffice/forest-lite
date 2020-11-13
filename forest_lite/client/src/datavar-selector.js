import * as R from "ramda"
import { lensPath, view } from "ramda"
import { findById } from "./helpers.js"


export const dataVarById = datasetId => state => {
    const { datasets = [] } = state
    if (datasets.length > 0) {
        const dataset = findById(datasets, datasetId)
        const { active: flags = {} } = dataset
        return R.pipe(
            R.pickBy(R.identity),
            R.keys,
            R.head
        )(flags)
    }
    return null
}


export const colorbarByIdAndVar = datasetId => dataVar => state => {
    // Default settings. NOTE: default is a reserved keyword in JS
    const { datasets = [] } = state
    const empty = { palette: [], low: 0, high: 1 }
    if (typeof datasetId === "undefined") return empty

    // Process application state
    const { colorbar: colorbars = {} } = findById(datasets, datasetId)
    const key = dataVar || "default"
    const primary = colorbars["default"] || {}
    const colorbar = colorbars[key] || primary
    const { colors: palette = [], low = 0, high = 1 } = colorbar

    // Get data-limits
    if (typeof dataVar !== "undefined") {
        const limitsLens = lensPath([ "limits", datasetId, dataVar ])
        const limits = view(limitsLens)(state)
        if (typeof limits !== "undefined") {
            const { low: _low, high: _high } = limits
            return { palette, low: _low, high: _high }
        }
    }
    return { palette, low, high }
}
