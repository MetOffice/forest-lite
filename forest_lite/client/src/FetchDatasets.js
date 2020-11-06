import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useAuth } from "./context/Auth.js"
import { set_datasets } from "./actions.js"


const FetchDatasets = ({ baseURL }) => {
    const dispatch = useDispatch()
    const { token } = useAuth()
    useEffect(() => {
        // Fetch datasets from server
        fetch(`${baseURL}/datasets`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                'accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => data.datasets)
            .then(datasets => dispatch(set_datasets(datasets)))
    }, [token])
    useEffect(() => {
        // Fetch datasets from server
        fetch(`${baseURL}/users/me`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                'accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(console.log)
    }, [token])
    return null
}


export default FetchDatasets
