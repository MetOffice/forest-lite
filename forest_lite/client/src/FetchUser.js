import React, { useEffect } from "react"
import { useAuth } from "./context/Auth.js"
import { LOGGED_IN } from "./status.js"


// Get user associated with token
const FetchUser = ({ baseURL }) => {
    const { token, setUser, setStatus } = useAuth()
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
            .then(() => setStatus(LOGGED_IN))
    }, [token])
    return null
}


export default FetchUser
