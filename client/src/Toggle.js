import React from "react"


export default class Toggle extends React.Component {
    render() {
        let spanStyle = {}
        let iconStyle = {}
        if (!this.props.active) {
            // Disabled state styling
            spanStyle = { backgroundColor: "#EEE" }
            iconStyle = { color: "#BBB" }
        }
        let className = this.props.icon + " fa-stack-1x"
        return (
            <span className="tool-icon fa-stack fa-1x"
                  style={ spanStyle }
                  onClick={ () => this.props.onClick() }>
                <i className={ className } style={ iconStyle }></i>
            </span>
        )
    }
}
