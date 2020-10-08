import React from "react"
import AnimationControls from "./AnimationControls.js"
import MapFigure from "./MapFigure.js"
import Title from "./Title.js"
import Colorbar from "./Colorbar.js"
import LayerMenu from "./LayerMenu.js"
import ViewPort from "./ViewPort.js"
import ZoomButton from "./ZoomButton.js"
import "./App.css"

//    return (
//        <>
//            <Title />
//            <LayerMenu baseURL={ baseURL } />
//            <div className="footer-container">
//                <Colorbar />
//                <AnimationControls />
//            </div>
//            <MapFigure className="App-map" baseURL={ baseURL } />
//            <ViewPort baseURL={ baseURL } />
//            <ZoomButton />
//        </>
//    )

const App = (props) => {
    const { baseURL } = props
    return (
        <>
            <Title className="App-title" />
            <div className="App-sidebar">
                <LayerMenu baseURL={ baseURL } />
            </div>
            <div className="App-colorbar"><Colorbar /></div>
            <MapFigure className="App-map" baseURL={ baseURL } />
            <ViewPort baseURL={ baseURL } />
            <div className="App-controls">
                <AnimationControls />
                <ZoomButton />
            </div>
        </>
    )
}

export default App
