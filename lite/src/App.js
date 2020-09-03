import React from "react"
import Toolbar from "./Toolbar.js"
import Tile from "./Tile.js"


class App extends React.Component {
    render() {
        return (
            <div>
                <Toolbar />
                <Tile figure={ this.props.figure }
                      color_mapper={ this.props.color_mapper } />
            </div>
        )
    }
}


export default App
