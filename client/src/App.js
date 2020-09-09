import React from "react"
import Title from "./Title.js"
import Toolbar from "./Toolbar.js"
import ColorPalette from "./ColorPalette.js"
import Colorbar from "./Colorbar.js"
import LayerMenu from "./LayerMenu.js"
import Layers from "./Layers.js"
import Lines from "./Lines.js"


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
                <Lines url={ baseURL + '/atlas/coastlines' }
                    figure={ figure } />
                <Lines url={ baseURL + '/atlas/borders' }
                    figure={ figure } />
                <Lines url={ baseURL + '/atlas/disputed' }
                    figure={ figure } line_color="red" />
                <Lines url={ baseURL + '/atlas/lakes' }
                    figure={ figure } line_color="LightBlue" />
            </div>
        )
    }
}


export default App
