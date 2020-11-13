import React from "react"
import { useSelector } from "react-redux"
import Colorbar from "./Colorbar.js"
import * as R from "ramda"


// Colorbar vertical stack
const ColorbarStack = () => {
    const datasets = useSelector(state => state.datasets || [])
    const makeColorbars = R.map(dataset => {
        const { id } = dataset
        return <Colorbar key={ id } datasetId={ id } />
    })
    return <>{ makeColorbars(datasets) }</>
}


export default ColorbarStack
