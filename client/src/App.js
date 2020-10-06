import React from "react"
import AnimationControls from "./AnimationControls.js"
import MapFigure from "./MapFigure.js"
import Title from "./Title.js"
import Colorbar from "./Colorbar.js"
import LayerMenu from "./LayerMenu.js"
import ViewPort from "./ViewPort.js"
import ZoomButton from "./ZoomButton.js"


const App = (props) => {
    const { baseURL } = props
    return (
        <div>
            <Title />
            <LayerMenu baseURL={ baseURL } />
            <div className="footer-container">
                <Colorbar />
                <AnimationControls />
            </div>
            <MapFigure baseURL={ baseURL } />
            <ViewPort baseURL={ baseURL } />
            <ZoomButton />
        </div>
    )
}

export default App
