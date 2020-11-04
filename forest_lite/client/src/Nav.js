import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import Select from "./Select.js"
import "./Nav.css"


const selectDatasets = state => {
    return state.datasets || []
}


const List = ({ labels, onClick, selectedLabel }) => {
    const listItems = labels.map(label => {
        const selected = selectedLabel === label
        let className
        if (selected) {
            className = "nav__item nav__item--selected"
        } else {
            className = "nav__item"
        }
        return <li key={ label }
            className={ className }
            onClick={ onClick(label) }>{ label }</li>
    })
    return <ul>{ listItems }</ul>
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

const Nav = ({ baseURL }) => {
    const [ dataset, setDataset ] = useState(null)
    const [ variable, setVariable ] = useState(null)
    const [ dimension, setDimension ] = useState(null)
    const [ point, setPoint ] = useState(null)
    const [ variables, setVariables ] = useState([])
    const [ dimensions, setDimensions ] = useState([])
    const [ points, setPoints ] = useState([])

    const datasets = useSelector(selectDatasets)
    const labels = datasets.map(dataset => dataset.label)
    const toID = datasets.reduce((agg, dataset) => {
        agg[dataset.label] = dataset.id
        return agg
    }, {})

    // Populate variables list
    useEffect(() => {
        if ( dataset != null ) {
            const index = labels.indexOf(dataset)
            const variables = getDataVars(datasets[index])
            setVariables(variables)
            if ( variables.indexOf(variable) !== -1 ) {
                const description = datasets[index].description
                const dims = description.data_vars[variable].dims
                setDimensions(dims)
            }
        }
    }, [ dataset, variable ])

    // Get dimension points from REST endpoint
    useEffect(() => {
        const datasetID = toID[dataset]
        const url = pointURL(baseURL, datasetID, variable, dimension)
        if (url != null) {
            fetch(url)
                .then(response => response.json())
                .then(json => json.points)
                .then(setPoints)
        }
    }, [ dataset, variable, dimension ])

    const pointLabels = points.map((point, index) => `${index} - ${point}`)

    return (
        <div className="nav__container">
            <Select
                label="Dataset:"
                value={ dataset }
                values={ labels }
                callback={ setDataset  } />
            <Select
                label="Variable:"
                value={ variable }
                values={ variables }
                callback={ setVariable  } />
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
        </div>
    )
}


export default Nav
