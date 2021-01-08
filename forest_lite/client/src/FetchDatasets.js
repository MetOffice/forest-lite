import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import { set_datasets } from "./actions.js"


const FetchDatasets = ({ baseURL }) => {
    const dispatch = useDispatch()
    useEffect(() => {
        // Fetch datasets from server
        fetch(`${baseURL}/datasets`)
            .then(response => response.json())
            .then(data => data.datasets)
            .then(datasets => dispatch(set_datasets(datasets)))
    }, [])
    return null
}


export default FetchDatasets
