import React from "react"
import { connect } from "react-redux"

const almostEqual = function(x0, x1) {
    return Math.abs(x0 - x1) <= 0.001
}

class XYRange extends React.Component {
    render() {
        const { figure, x_range, y_range } = this.props
        if (typeof x_range === "undefined") return null
        if (typeof y_range === "undefined") return null
        const figure_ratio = figure.inner_width / figure.inner_height
        const aspect_ratio = (x_range.end - x_range.start) / (y_range.end - y_range.start)

        if (!almostEqual(figure_ratio, aspect_ratio)) {
            // x_range constant
            const dx = x_range.end - x_range.start
            const dy = y_range.end - y_range.start
            const new_dy = dx / figure_ratio
            const center = (y_range.start + y_range.end) / 2
            y_range.start = center - (new_dy / 2)
            y_range.end = center + (new_dy / 2)

        }

        // Dirty solution to see if assignment is interrupting scroll
        if (!almostEqual(figure.x_range.start, x_range.start)) {
            figure.x_range.start = x_range.start
        }
        if (!almostEqual(figure.y_range.start, y_range.start)) {
            figure.y_range.start = y_range.start
        }
        if (!almostEqual(figure.x_range.end, x_range.end)) {
            figure.x_range.end = x_range.end
        }
        if (!almostEqual(figure.y_range.end, y_range.end)) {
            figure.y_range.end = y_range.end
        }
        return null
    }
}


const mapStateToProps = state => {
    const { figure } = state
    if (typeof figure === "undefined") return {}
    return {
        x_range: figure.x_range,
        y_range: figure.y_range,
    }
}


export default connect(mapStateToProps)(XYRange)
