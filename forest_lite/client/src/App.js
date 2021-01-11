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
import User from "./User.js"


// React router
import {
    HashRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom"


const App = ({ baseURL }) => {
    return (
        <Router>
            <div className="App-window">
                <div className="App-navbar">
                    <ul>
                        <li className="App-navbar--left"><Link to="/">
                                <Logo width={ "1em" } mode={ "icon" } />
                            </Link></li>
                        <li><Link to="/user">Account</Link></li>
                        <li><Link to="/about">About</Link></li>
                    </ul>
                </div>
                <Switch>
                    <Route exact path="/">
                        <Main baseURL={ baseURL } />
                    </Route>
                    <Route exact path="/user">
                        <User />
                    </Route>
                    <Route exact path="/about">
                        <About baseURL={ baseURL } />
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
