import React, { useState } from "react"
import { useAuth } from "./context/Auth.js"
import "./LoginForm.css"


const LoginForm = ({ baseURL }) => {
    const [ username, setUsername ] = useState("")
    const [ password, setPassword ] = useState("")
    const { user, setToken } = useAuth()

    const onSubmit = (ev) => {
        ev.preventDefault()
        const body = (
            "username=" + encodeURIComponent(username) + "&" +
            "password=" + encodeURIComponent(password)
        )
        fetch(`${baseURL}/token`, {
            method: "POST",
            body: body,
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                'accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(json => {
                const { access_token } = json
                setToken(access_token)
            })
    }

    const onUsername = (ev) => {
        setUsername(ev.target.value)
    }

    const onPassword = (ev) => {
        setPassword(ev.target.value)
    }

    if (user != null) {
        return null
    }

    return (
<div className="LoginForm">
    <div className="LoginForm__form">
        <h3>FOREST Lite</h3>
        <p className="LoginForm__p">Welcome to FOREST!</p>
        <form id="login" onSubmit={ onSubmit }>
            <div className="LoginForm__textbox">
                <label
                    className="LoginForm__label"
                    htmlFor="usr">User:</label>
                <input
                    className="LoginForm__input"
                    name="username"
                    onChange={ onUsername }
                    value={ username }
                    id="usr" />
            </div>
            <div className="LoginForm__textbox">
                <label
                    className="LoginForm__label"
                    htmlFor="pwd">Password:</label>
                <input
                    className="LoginForm__input"
                    onChange={ onPassword }
                    type="password"
                    name="password"
                    value={ password }
                    id="pwd" />
            </div>
            <div>
                <input
                    className="LoginForm__button--continue"
                    type="submit"
                    name="action"
                    value="Continue without login" />
                <input
                    className="LoginForm__button--login"
                    type="submit"
                    name="action"
                    value="Login" />
            </div>
        </form>
    </div>
</div>
    )
}


export default LoginForm
