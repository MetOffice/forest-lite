import React from "react"
import Title from "./Title.js"
import Toolbar from "./Toolbar.js"
import TiledImage from "./TiledImage.js"
import ColorPalette from "./ColorPalette.js"
import Colorbar from "./Colorbar.js"
import RDT from "./RDT.js"


class App extends React.Component {
    render() {
        const el = document.getElementById("colorbar-figure")
        return (
            <div>
                <Title />
                <Toolbar />
                <TiledImage
                     baseURL={ this.props.baseURL }
                     figure={ this.props.figure }
                     color_mapper={ this.props.color_mapper } />
                <RDT
                     baseURL={ this.props.baseURL }
                     figure={ this.props.figure } />
                <ColorPalette
                     color_mapper={ this.props.color_mapper } />
                <Colorbar el={ el } />
            </div>
        )
    }
}


export default App
