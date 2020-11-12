import React from "react"
import "./LoginStatus.css"
import { useAuth } from "./context/Auth.js"


const LoginStatus = () => {
    const { user, setUser } = useAuth()
    const onClick = ev => {
        setUser(null)
    }
    let msg
    if (user != null) {
        return (
            <div>
                <span onClick={ onClick }
                      className="LoginStatus LoginStatus__button">
                    <i className="fas fa-sign-out-alt" /> Sign out
                </span>
            </div>)
    } else {
        return (
            <div>
                <span className="LoginStatus LoginStatus__button">
                    <i className="fas fa-sign-in-alt" /> Sign in
                </span>
            </div>)
    }
}


export default LoginStatus
