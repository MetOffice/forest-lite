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
import "./App.css"
import { AuthContext } from "./context/Auth.js"
import { LOGGED_OUT } from "./status.js"


const App = (props) => {

    // Simple localStorage authentication via tokens
    const [ status, setStatus ] = useState(LOGGED_OUT)
    const [ user, setUser ] = useState(null)
    const localStorageToken = localStorage.getItem("token")
    const [ token, setAuthToken ] = useState(localStorageToken)
    const setToken = (value) => {
        localStorage.setItem("token", value)
        setAuthToken(value)
    }

    const { baseURL } = props
    return (
        // Pass login state and setToken callback to components
        <AuthContext.Provider value={{ token, setToken, user, setUser,
                status, setStatus }}>
            <LoginForm baseURL={ baseURL } />
            <div className="App-title">
                <Title/>
            </div>
            <div className="App-sidebar">
                <Sidebar baseURL={ baseURL } />
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
            <ColorPaletteFetch baseURL={ baseURL } />
            <FetchDatasets baseURL={ baseURL } />
            <FetchUser baseURL={ baseURL } />
        </AuthContext.Provider>
    )
}

export default App
