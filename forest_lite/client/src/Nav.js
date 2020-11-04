import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
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

    // Points
    const [ point, setPoint ] = useState(null)
    const [ points, setPoints ] = useState([])
    const pointLabels = points.map((point, index) => `${index} - ${point}`)

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
                setDimensions(dims)
            }
        }
    }, [ datasetName, dataVar ])

    // Get dimension points from REST endpoint
    useEffect(() => {
        const datasetID = toID[datasetName]
        const url = pointURL(baseURL, datasetID, dataVar, dimension)
        if (url != null) {
            fetch(url)
                .then(response => response.json())
                .then(json => {
                    console.log(json)
                    return json
                })
                .then(json => {
                    // Transform points
                    if (json.attrs.standard_name === "time") {
                        return json.data.map(d => {
                            return new Date(d)
                        })
                    }
                    return json.data
                })
                .then(setPoints)
        }
    }, [ datasetName, dataVar, dimension ])

    return (<div className="nav__panel">
        <div className="nav__title">{ datasetName }</div>
        <div className="nav__title--caption">{ dataVar }</div>
        <Select
            label="Dimension:"
            value={ dimension }
            values={ dimensions }
            callback={ setDimension  } />
        <Select
            label="Axis:"
            value={ point }
            values={ pointLabels }
            callback={ setPoint  } />
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
