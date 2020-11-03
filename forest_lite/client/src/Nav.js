import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
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


const Nav = () => {
    const [ dataset, setDataset ] = useState(null)
    const [ variable, setVariable ] = useState(null)
    const [ dimension, setDimension ] = useState(null)
    const [ variables, setVariables ] = useState([])
    const [ dimensions, setDimensions ] = useState([])

    const datasets = useSelector(selectDatasets)
    const labels = datasets.map(dataset => dataset.label)
    const onClick = label => () => { setDataset(label) }

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

    const selectVar = label => () => {
        setVariable(label)
    }
    const selectDim = label => () => {
        setDimension(label)
    }

    return (
        <div className="nav__container">
            <div>Datasets</div>
            <List labels={ labels } selectedLabel={ dataset } onClick={ onClick } />
            <div>Variables</div>
            <List labels={ variables } selectedLabel={ variable } onClick={ selectVar } />
            <div>Dimensions</div>
            <List labels={ dimensions } selectedLabel={ dimension } onClick={ selectDim } />
            <div>
                <div>Dataset: { dataset }</div>
                <div>Variable: { variable }</div>
                <div>Dimension: { dimension }</div>
            </div>
        </div>
    )
}


export default Nav
