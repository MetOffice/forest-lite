import React from "react"
import { connect } from "react-redux"
import { ColumnDataSource } from "@bokeh/bokehjs/build/js/lib/models"



/**
 * Annotate map with coastlines, borders and lake boundaries
 */
class Lines extends React.Component {
    constructor(props) {
        super(props)
        const { figure, line_color = "black" } = props
        const source = new ColumnDataSource({
            data: {
                xs: [[]],
                ys: [[]]
            }
        })
        const renderer = figure.multi_line({
            xs: { field: "xs" },
            ys: { field: "ys" },
            line_color: line_color,
            source: source,
        })
        renderer.level = "overlay" // NOTE: only prop assignment works
        this.state = { source, renderer }
    }

    componentDidMount() {
        this.fetch(this.props.url)
    }

    render() {
        const active = this.props.active
        const { renderer } = this.state
        console.log(active)
        renderer.visible = active
        return null
    }

    fetch(url) {
        const source = this.state.source
        fetch(url)
            .then(response => response.json())
            .then((data) => {
                source.data = data
            })
    }
}


const mapStateToProps = state => {
    const { coastlines: active = true } = state
    return { active }
}


export default connect(mapStateToProps)(Lines)
