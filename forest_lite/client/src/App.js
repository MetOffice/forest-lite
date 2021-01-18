import React, { useState } from "react"
import AnimationControls from "./AnimationControls.js"
import MapFigure from "./MapFigure.js"
import Title from "./Title.js"
import ColorbarStack from "./ColorbarStack.js"
import ColorPaletteFetch from "./ColorPaletteFetch.js"
import FetchDatasets from "./FetchDatasets.js"
import FetchUser from "./FetchUser.js"
import Sidebar from "./Sidebar.js"
import ViewPort from "./ViewPort.js"
import ZoomButton from "./ZoomButton.js"
import LoginForm from "./LoginForm.js"
import LoginStatus from "./LoginStatus.js"
import "./App.css"
import { AuthContext } from "./context/Auth.js"
import { LOGGED_OUT } from "./status.js"
import { About } from "./About.js"
import { Logo } from "./Logo.js"

// Account user interface Elm app
import Elm from "react-elm-components"
import Account from "./elm-app/dist/account.js"
import "./Elm.css"


// React router
import {
    HashRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom"


const App = ({ baseURL }) => {
    const flags = {
        name: "Martin, Bob",
        given_name: "Bob",
        family_name: "Martin",
        email: "user@example.com",
        groups: ["forest-wcssp", "forest-highway"],
        iat: 0,
        exp: 0,
        auth_time: 0,
    }
    return (
        <Router>
            <div className="App-window">
                <div className="App-navbar">
                    <ul>
                        <li className="App-navbar--left"><Link to="/">
                                <Logo width={ "1em" } mode={ "icon" } />
                            </Link></li>
                        <li><Link to="/account">Account</Link></li>
                        <li><Link to="/about">About</Link></li>
                    </ul>
                </div>
                <Switch>
                    <Route exact path="/">
                        <Main baseURL={ baseURL } />
                    </Route>
                    <Route exact path="/about">
                        <About baseURL={ baseURL } />
                    </Route>
                    <Route exact path="/account">
                        <Elm src={ Account.Elm.Main } flags={ flags } />
                    </Route>
                </Switch>
            </div>
        </Router>
    )
}


/**
 * Map interface for exploring datasets
 */
const Main = ({ baseURL }) => {
    return (
        <div className="App-container">
            <div className="App-sidebar">
                <Sidebar baseURL={ baseURL } />
            </div>
            <div className="App-content">
                <div className="App-title">
                    <Title/>
                </div>
                <div className="App-colorbar">
                    <ColorbarStack />
                </div>
                <MapFigure className="App-map" baseURL={ baseURL } />
                <ViewPort baseURL={ baseURL } />
                <div className="App-controls">
                    <AnimationControls />
                </div>
                <div className="App-zoom">
                    <ZoomButton />
                </div>
            </div>
            <ColorPaletteFetch baseURL={ baseURL } />
            <FetchDatasets baseURL={ baseURL } />
        </div>
    )
}

export default App
