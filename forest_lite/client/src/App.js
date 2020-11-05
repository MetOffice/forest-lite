import React from "react"
import AnimationControls from "./AnimationControls.js"
import MapFigure from "./MapFigure.js"
import Title from "./Title.js"
import ColorbarStack from "./ColorbarStack.js"
import ColorPaletteFetch from "./ColorPaletteFetch.js"
import Sidebar from "./Sidebar.js"
import ViewPort from "./ViewPort.js"
import ZoomButton from "./ZoomButton.js"
import "./App.css"


const App = (props) => {
    const { baseURL } = props
    return (
        <>
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
        </>
    )
}

export default App
