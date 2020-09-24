import React from "react"
import AnimationControls from "./AnimationControls.js"
import MapFigure from "./MapFigure.js"
import Title from "./Title.js"
import Colorbar from "./Colorbar.js"
import LayerMenu from "./LayerMenu.js"
import LocalStorage from "./LocalStorage.js"
import StateToggle from "./StateToggle.js"


class Panel extends React.Component {
    render() {
        const { children } = this.props
        const style = {
            backgroundColor: "white",
            zIndex: 10,
            borderBottom: "1px solid #ccc"
        }
        return <div style={ style } >{ children }</div>
    }
}

class App extends React.Component {
    render() {
        const { baseURL } = this.props
        return (
            <div>
                <LocalStorage />
                <Panel>
                    <div style={{ float: "right" }} >
                        <StateToggle
                            icon="fas fa-layer-group"
                            attr="layers" />
                    </div>
                    <Title />
                    <LayerMenu baseURL={ baseURL } />
                </Panel>
                <StateToggle
                    icon="far fa-comment-alt"
                    attr="hover_tool" />
                <StateToggle
                    icon="fas fa-palette"
                    attr="colorbar" />
                <div className="colorbar-container">
                    <Colorbar />
                    <AnimationControls />
                </div>
                <MapFigure baseURL={ baseURL } />
            </div>
        )
    }
}


export default App
