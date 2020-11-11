import React from "react"
import "./LoginStatus.css"
import { useAuth } from "./context/Auth.js"


const LoginStatus = () => {
    const { loggedIn, setToken } = useAuth()
    const onClick = ev => {
        setToken(null)
    }
    let msg
    if (loggedIn) {
        msg = (
            <span className="LoginStatus">
                <i className="fas fa-sign-out-alt" /> Sign out
            </span>
        )
    } else {
        msg = (
            <span className="LoginStatus">
                <i className="fas fa-sign-in-alt" /> Sign in
            </span>
        )
    }
    return <div onClick={ onClick }>{ msg }</div>
}


export default LoginStatus
