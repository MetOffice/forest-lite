import React from "react"
import { useDispatch, useSelector } from "react-redux"
import "./LoginStatus.css"
import { useAuth } from "./context/Auth.js"
import { setState } from "./actions.js"


const LoginStatus = () => {
    const dispatch = useDispatch()
    const figure = useSelector(state => state.figure || null)
    const { user, setUser} = useAuth()
    const onClick = ev => {
        setUser(null)
        dispatch(setState({ figure }))
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
