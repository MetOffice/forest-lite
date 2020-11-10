import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import moment from "moment-timezone"
import { uniq, view, lensPath } from "ramda"
import Select from "./Select.js"
import "./Nav.css"
import { updateNavigate } from "./actions.js"


/**
 * Select active dataVars
 */
export const selectActive = state => {
    const datasets = state.datasets || []
    return datasets.flatMap(dataset => {
        const active = dataset.active || {}
        const dataVars = Object.keys(active).filter(key =>  active[key])
        return dataVars.map(dataVar => {
            return {
                label: dataset.label,
                id: dataset.datasetId,
                dataVar: dataVar
            }
        })
    })
}

export const selectDatasets = state => {
    return state.datasets || []
}

export const selectNavigate = state => {
    return state.navigate || {}
}


const getDataVars = tree => {
    return Object.keys(tree.description.data_vars)
}


const pointURL = (baseURL, datasetID, variable, dimension) => {
    if (baseURL == null) return null
    if (datasetID == null) return null
    if (variable == null) return null
    if (dimension == null) return null
    return `${baseURL}/datasets/${datasetID}/${variable}/axis/${dimension}`
}


export const NavPanel = ({ baseURL, datasets, datasetName, dataVar, point={} }) => {

    // Dispatch actions
    const dispatch = useDispatch()

    // Dimensions
    const [ dimension, setDimension ] = useState(null)
    const [ dimensions, setDimensions ] = useState([])

    // Axes
    const [ axes, setAxes ] = useState([])

    // Populate variables list
    const labels = datasets.map(dataset => dataset.label)
    const toID = datasets.reduce((agg, dataset) => {
        agg[dataset.label] = dataset.id
        return agg
    }, {})
    useEffect(() => {
        if ( datasetName != null ) {
            const index = labels.indexOf(datasetName)
            const variables = getDataVars(datasets[index])
            if ( variables.indexOf(dataVar) !== -1 ) {
                const description = datasets[index].description
                const dims = description.data_vars[dataVar].dims
                const dimensions = dims.filter(dim => {
                    return ["latitude", "longitude"].indexOf(dim) === -1
                })
                setDimensions(dimensions)
            }
        }
    }, [ datasetName, dataVar ])

    // Get dimension points from REST endpoint
    useEffect(() => {
        const datasetID = toID[datasetName]

        // Dimension endpoints
        const requests = dimensions.map(dim => {
            const url = pointURL(baseURL, datasetID, dataVar, dim)
            return {
                dimension: dim,
                url
            }
        }).filter(request => request.url != null)

        // Fetch dimensions
        const promises = requests.map(request => {
            return fetch(request.url)
                .then(response => response.json())
                .then(json => {
                    return json
                })
                .then(json => {
                    // Transform points
                    let data = json.data
                    if (json.attrs.standard_name === "time") {
                        data = json.data.map(d => {
                            return moment(d).tz("UTC").format()
                        })
                    }
                    return {
                        data: uniq(data),
                        units: json.attrs.units || ""
                    }
                })
                .then(packet => {
                    return {
                        dimension: request.dimension,
                        values: packet.data,
                        units: packet.units
                    }
                })
        })

        // Gather dimension data
        Promise.all(promises)
               .then(setAxes)

    }, [ datasetName, dataVar, dimensions ])

    const selects = axes.map(axis => {
        let label
        if (axis.units === "") {
            label = `Dimension: ${axis.dimension}`
        } else {
            label = `Dimension: ${axis.dimension} [${axis.units}]`
        }
        const callback = (value) => {
            // TODO: Implement change to application state from here
            const action = updateNavigate({
                datasetName,
                dataVar,
                dimension: axis.dimension,
                value
            })
            dispatch(action)
        }
        const value = point[axis.dimension] || null
        return <Select
            key={ axis.dimension }
            label={ label }
            value={ value }
            values={ axis.values }
            callback={ callback  } />
    })

    return (<div className="nav__panel">
        { selects }
    </div>)
}

const Nav = ({ baseURL }) => {
    const activeLayers = useSelector(selectActive)
    const datasets = useSelector(selectDatasets)
    const navigate = useSelector(selectNavigate)
    const panels = activeLayers.map(layer => {
        const key = `${layer.label} ${layer.dataVar}`
        const point = view(lensPath([ layer.label, layer.dataVar ]), navigate)
        return <NavPanel
                    key={ key }
                    baseURL={ baseURL }
                    datasets={ datasets }
                    datasetName={ layer.label }
                    dataVar={ layer.dataVar }
                    point={ point } />
    })
    return (
        <div className="nav__container">
            { panels }
        </div>
    )
}


export default Nav
