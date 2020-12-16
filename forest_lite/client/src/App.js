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
import { ToggleButton } from "./buttons"


// React router
import {
    HashRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom"


const App = ({ baseURL }) => {
    // Simple localStorage authentication via tokens
    const [ status, setStatus ] = useState(LOGGED_OUT)
    const [ user, setUser ] = useState(null)
    const localStorageToken = localStorage.getItem("token")
    const [ token, setAuthToken ] = useState(localStorageToken)
    const setToken = (value) => {
        localStorage.setItem("token", value)
        setAuthToken(value)
    }
    return (
        <AuthContext.Provider value={{ token, setToken, user, setUser,
                status, setStatus }}>
        <Router>
            <div className="App-window">
                <div className="App-navbar">
                    <ul>
                        <li className="App-navbar--left"><Link to="/">
                                <Logo width={ "1em" } mode={ "icon" } />
                            </Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/login"><LoginStatus /></Link></li>
                    </ul>
                </div>
                <Switch>
                    <Route exact path="/">
                        <Main baseURL={ baseURL } />
                    </Route>
                    <Route exact path="/about">
                        <About baseURL={ baseURL } />
                    </Route>
                    <Route path="/login">
                        <LoginForm baseURL={ baseURL } />
                    </Route>
                </Switch>
            </div>
            <FetchUser baseURL={ baseURL } />
        </Router>
        </AuthContext.Provider>
    )
}


const ColorbarSettings = () => {
    const [ mode, setMode ] = useState("Auto")
    const onChange = value => {
        setMode(value)
    }

    const manualStyle = {
        width: "100%",
        marginTop: "0.5em",
        color: "#333",
        lineHeight: "2em"
    }
    const inputStyle = {
        width: "100%",
        boxSizing: "border-box"
    }
    const labelStyle = {
        display: "block"
    }
    let manualEls = null
    if (mode === "Manual") {
        manualEls = (<div style={ manualStyle } >
            <div>
                <label style={ labelStyle } >Lower limit:</label>
                <input style={ inputStyle } type="text" />
            </div>
            <div>
                <label style={ labelStyle } >Upper limit:</label>
                <input style={ inputStyle } type="text" />
            </div>
        </div>)
    }

    const style = {
        margin: "1em",
        fontFamily: "Helvetica"
    }
    return (<div style={ style }>
        <ToggleButton
                title="Select data limits:"
                onChange={ onChange }
                name="limits"
                checked={ mode }
                choices={ [ "Auto", "Manual" ] } />
        { manualEls }
    </div>)
}


/**
 * Map interface for exploring datasets
 */
const Main = ({ baseURL }) => {
    return (
        <div className="App-container">
            <div className="App-sidebar">
                <Sidebar baseURL={ baseURL } />
                <ColorbarSettings />
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
