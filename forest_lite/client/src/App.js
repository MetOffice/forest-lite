import React, { useState } from "react"
import { useDispatch } from "react-redux"
import AnimationControls from "./AnimationControls.js"
import MapFigure from "./MapFigure.js"
import ColorbarStack from "./ColorbarStack.js"
import ColorPaletteFetch from "./ColorPaletteFetch.js"
import Sidebar from "./Sidebar.js"
import ViewPort from "./ViewPort.js"
import ZoomButton from "./ZoomButton.js"
import "./App.css"
import { About } from "./About.js"
import { Logo } from "./Logo.js"

// JWT token from Cookie
import { useJWTClaim } from "./jwt.js"

// Account user interface Elm app
import Elm from "react-elm-components"
import ElmApp from "./elm-app/src/Main.elm"
import "./Elm.css"
import { setPorts } from "./actions.js"


// React router
import {
    HashRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom"

// Web worker
import { WebWorker } from "./web-worker-middleware.js"

// Web components
import "./web-components"


// Elm ports
const setupPorts = dispatch => ports => {

    // Simple nav system while using Elm/React hybrid app
    ports.receiveData.send({
        label: "hashchange",
        payload: window.location.hash
    })
    window.addEventListener("hashchange", () => {
        ports.receiveData.send({
            label: "hashchange",
            payload: window.location.hash
        })
    })

    // Connect Elm app to React app
    ports.sendAction.subscribe(message => {
        const action = JSON.parse(message)
        dispatch(action)
    })

    // Connect React components to Elm
    dispatch(setPorts(ports))
}


const App = ({ baseURL }) => {
    const flags = {
        claim: useJWTClaim("TOKEN"),
        baseURL: baseURL
    }

    console.log(flags)

    const dispatch = useDispatch()
    return (
        <Router>
            <WebWorker />
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
                        <Main baseURL={ baseURL } flags={ flags } />
                    </Route>
                    <Route exact path="/about">
                        <About baseURL={ baseURL } />
                    </Route>
                    <Route exact path="/account">
                        <Elm src={ ElmApp.Elm.Main } flags={ flags }
                             ports={ setupPorts(dispatch) } />
                    </Route>
                </Switch>
            </div>
        </Router>
    )
}


/**
 * Map interface for exploring datasets
 */
const Main = ({ baseURL, flags }) => {
    const dispatch = useDispatch()
    return (
        <div className="App-container">
            <div className="App-sidebar">
                <Sidebar baseURL={ baseURL }>
                <Elm src={ ElmApp.Elm.Main } flags={ flags }
                     ports={ setupPorts(dispatch) } />
                </Sidebar>
            </div>
            <div className="App-content">
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
        </div>
    )
}

export default App
