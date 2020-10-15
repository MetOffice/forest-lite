import * as R from "ramda"
import { lensPath, view } from "ramda"


export const dataVarById = datasetId => state => {
    const { datasets = [] } = state
    if (datasets.length > 0) {
        const flags = datasets[datasetId].active || {}
        return R.pipe(
            R.pickBy(R.identity),
            R.keys,
            R.head
        )(flags)
    }
    return null
}


export const colorbarByIdAndVar = datasetId => dataVar => state => {
    const { datasets = [] } = state
    const { colorbar: colorbars = {} } = datasets[datasetId]
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
