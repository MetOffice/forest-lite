import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import moment from "moment-timezone"
import { uniq } from "ramda"
import Select from "./Select.js"
import "./Nav.css"


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


const NavPanel = ({ baseURL, datasetName, dataVar }) => {
    // Dimensions
    const [ dimension, setDimension ] = useState(null)
    const [ dimensions, setDimensions ] = useState([])

    // Point in N-dimensional space
    const [ point, setPoint ] = useState({})

    // Axes
    const [ axes, setAxes ] = useState([])

    // Populate variables list
    const datasets = useSelector(selectDatasets)
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
                    if (json.attrs.standard_name === "time") {
                        return json.data.map(d => {
                            return moment(d).tz("UTC").format()
                        })
                    }
                    return json.data
                })
                .then(uniq)
                .then(values => {
                    return {
                        dimension: request.dimension,
                        values: values
                    }
                })
        })

        // Gather dimension data
        Promise.all(promises)
               .then(setAxes)

    }, [ datasetName, dataVar, dimensions ])

    const selects = axes.map(axis => {
        const label = `Dimension: ${axis.dimension}`
        const callback = (value) => {
            const replace = {}
            replace[axis.dimension] = value
            setPoint({
                ...point,
                ...replace
            })
        }
        return <Select
            key={ axis.dimension }
            label={ label }
            value={ point[axis.dimension] }
            values={ axis.values }
            callback={ callback  } />
    })

    return (<div className="nav__panel">
        <div className="nav__title">{ datasetName }</div>
        <div className="nav__title--caption">Variable: { dataVar }</div>
        { selects }
    </div>)
}

const Nav = ({ baseURL }) => {
    const activeLayers = useSelector(selectActive)
    const panels = activeLayers.map(layer => {
        const key = `${layer.label} ${layer.dataVar}`
        return <NavPanel
                    key={ key }
                    baseURL={ baseURL }
                    datasetName={ layer.label }
                    dataVar={ layer.dataVar } />
    })
    return (
        <div className="nav__container">
            { panels }
        </div>
    )
}


export default Nav
