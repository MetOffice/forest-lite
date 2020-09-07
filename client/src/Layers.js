import React from "react"
import TiledImage from "./TiledImage.js"
import RDT from "./RDT.js"


class Layers extends React.Component {
    render() {
        return (<>
            <TiledImage
                 baseURL={ this.props.baseURL }
                 figure={ this.props.figure }
                 color_mapper={ this.props.color_mapper } />
            <RDT
                 baseURL={ this.props.baseURL }
                 figure={ this.props.figure } />
        </>)
    }
}


export default Layers
