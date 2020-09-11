import React from "react"
import MapFigure from "./MapFigure.js"
import Title from "./Title.js"
import Toolbar from "./Toolbar.js"
import ColorPalette from "./ColorPalette.js"
import Colorbar from "./Colorbar.js"
import LayerMenu from "./LayerMenu.js"
import Layers from "./Layers.js"


class Panel extends React.Component {
    render() {
        const style = {
            margin: "20px",
            padding: "4px",
            zIndex: 5
        }
        return (
            <div className="menu abs-top right" style={ style } >
                <Toolbar />
                <LayerMenu />
            </div>)
    }
}

class App extends React.Component {
    render() {
        const el = document.getElementById("colorbar-figure")
        const { figure, baseURL, color_mapper } = this.props
        return (
            <div>
                <Title />
                <Panel />
                <Layers baseURL={ baseURL } figure={ figure }
                    color_mapper={ color_mapper } />
                <ColorPalette
                    color_mapper={ color_mapper } />
                <Colorbar el={ el } />
                <MapFigure baseURL={ baseURL } />
            </div>
        )
    }
}


export default App
