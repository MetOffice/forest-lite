import React from "react"
import "./LoginStatus.css"
import { useAuth } from "./context/Auth.js"


const LoginStatus = () => {
    const { token, setToken } = useAuth()
    const onClick = ev => {
        setToken(null)
    }
    let msg
    if (token == null) {
        msg = (
            <span className="LoginStatus">
                <i className="fas fa-sign-in-alt" /> Sign in
            </span>
        )
    } else {
        msg = (
            <span className="LoginStatus">
                <i className="fas fa-sign-out-alt" /> Sign out
            </span>
        )
    }
    return <div onClick={ onClick }>{ msg }</div>
}


export default LoginStatus
