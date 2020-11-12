import React, { useEffect } from "react"
import { useAuth } from "./context/Auth.js"


// Get user associated with token
const FetchUser = ({ baseURL }) => {
    const { token, setUser } = useAuth()
    useEffect(() => {
        fetch(`${baseURL}/users/me`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                'accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(json => {
                console.log(json)
                return json
            })
            .then(setUser)
    }, [token])
    return null
}


export default FetchUser
