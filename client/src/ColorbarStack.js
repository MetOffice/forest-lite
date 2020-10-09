import React from "react"
import { useSelector } from "react-redux"
import Colorbar from "./Colorbar.js"
import * as R from "ramda"


// Colorbar vertical stack
const ColorbarStack = () => {
    const datasets = useSelector(state => state.datasets || [])
    const makeColorbars = R.addIndex(R.map)((dataset, index) => {
        console.log(dataset)
        return <Colorbar key={ index } datasetId={ index } />
    })
    return <>{ makeColorbars(datasets) }</>
}


export default ColorbarStack
