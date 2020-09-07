import React from "react"
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
            padding: "4px"
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
        return (
            <div>
                <Title />
                <Panel />
                <Layers
                    baseURL={ this.props.baseURL }
                    figure={ this.props.figure }
                    color_mapper={ this.props.color_mapper } />
                <ColorPalette
                    color_mapper={ this.props.color_mapper } />
                <Colorbar el={ el } />
            </div>
        )
    }
}


export default App
