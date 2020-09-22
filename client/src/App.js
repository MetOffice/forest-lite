import React from "react"
import MapFigure from "./MapFigure.js"
import Title from "./Title.js"
import Toolbar from "./Toolbar.js"
import Colorbar from "./Colorbar.js"
import LayerMenu from "./LayerMenu.js"


class Panel extends React.Component {
    render() {
        const { baseURL } = this.props
        const style = {
            margin: "20px",
            padding: "4px",
            zIndex: 5
        }
        return (
            <div className="menu abs-top right" style={ style } >
                <Toolbar />
                <LayerMenu baseURL={ baseURL } />
            </div>)
    }
}

class App extends React.Component {
    render() {
        const el = document.getElementById("colorbar-figure")
        const { baseURL } = this.props
        return (
            <div>
                <Title />
                <Panel baseURL={ baseURL } />
                <Colorbar el={ el } />
                <MapFigure baseURL={ baseURL } />
            </div>
        )
    }
}


export default App
