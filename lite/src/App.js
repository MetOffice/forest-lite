import React from "react"
import Toolbar from "./Toolbar.js"
import TiledImage from "./TiledImage.js"


class App extends React.Component {
    render() {
        return (
            <div>
                <Toolbar />
                <TiledImage figure={ this.props.figure }
                     color_mapper={ this.props.color_mapper } />
            </div>
        )
    }
}


export default App
