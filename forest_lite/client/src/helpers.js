// Find dataset related to datasetId
export const findById = (datasets, datasetId) => {
    const ids = datasets.map(dataset => dataset.id)
    const index = ids.indexOf(datasetId)
    if (index == -1) {
        return {}  // Return empty object
    } else {
        return datasets[index]
    }
}
