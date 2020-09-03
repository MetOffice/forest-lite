import React from "react"
import { connect } from "react-redux"


class ColorPalette extends React.Component {
    render() {
        const { limits, palette, color_mapper } = this.props
        color_mapper.palette = palette
        color_mapper.low = limits.low
        color_mapper.high = limits.high
        return null
    }
}

export const mapStateToProps = state => {
    const { palette = [], limits = {low: 0, high: 1} } = state
    return { palette, limits }
}

export default connect(mapStateToProps)(ColorPalette)
