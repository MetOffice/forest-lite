import React from "react"
import Toolbar from "./Toolbar.js"
import TiledImage from "./TiledImage.js"
import ColorPalette from "./ColorPalette.js"
import Colorbar from "./Colorbar.js"


class App extends React.Component {
    render() {
        const el = document.getElementById("colorbar-figure")
        return (
            <div>
                <Toolbar />
                <TiledImage
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
