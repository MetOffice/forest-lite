import React from "react"
import { useDispatch, useSelector } from "react-redux"
import "./LoginStatus.css"
import { useAuth } from "./context/Auth.js"
import { setState } from "./actions.js"
import { LOGGED_IN, LOGGED_OUT } from "./status.js"


const LoginStatus = () => {
    const dispatch = useDispatch()
    const figure = useSelector(state => state.figure || null)
    const { status, setUser, setStatus} = useAuth()
    const onClick = ev => {
        setStatus(LOGGED_OUT)
        setUser(null)
        dispatch(setState({ figure }))
    }
    let msg
    if (status === LOGGED_IN) {
        return (
                <span onClick={ onClick }
                      className="LoginStatus LoginStatus__button">
                    <i className="fas fa-sign-out-alt" /> Sign out
                </span>)
    } else {
        return (
                <span className="LoginStatus LoginStatus__button">
                    <i className="fas fa-sign-in-alt" /> Sign in
                </span>)
    }
}


export default LoginStatus
