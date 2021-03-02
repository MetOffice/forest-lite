import React, { useEffect, useState } from "react"
import { connect, useSelector } from "react-redux"
import { ColumnDataSource } from "@bokeh/bokehjs/build/js/lib/models"


export const Coastlines = ({ figure }) => {
    return <NaturalEarthFeature figure={ figure } feature="coastlines" />
}


export const Borders = ({ figure }) => {
    return <NaturalEarthFeature figure={ figure } feature="borders" />
}


export const Lakes = ({ figure }) => {
    return <NaturalEarthFeature figure={ figure } feature="lakes" />
}


export const NaturalEarthFeature = ({ figure, feature }) => {
    const [ source, setSource ] = useState(null)
    const [ renderer, setRenderer ] = useState(null)

    const active = useSelector(selectActive)
    const data = useSelector(selectData(feature))
    const line_color = useSelector(selectLineColor(feature))

    useEffect(() => {
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

        // Update component state
        setSource(source)
        setRenderer(renderer)

    }, [])

    // Render application state
    if (renderer != null) {
        renderer.visible = active
        renderer.glyph.line_color = line_color
    }
    if (source != null) {
        source.data = data
    }

    return null
}


const selectActive = state => {
    const { coastlines: active = true } = state
    return active
}


const selectData = feature => state => {
    const empty = {
        xs: [[]],
        ys: [[]]
    }
    const { natural_earth_features = null } = state
    if (natural_earth_features == null) {
        return empty
    } else {
        return natural_earth_features[feature] || empty
    }
}

const selectLineColor = feature => state => {
    if (feature === "lakes") {
        return "LightBlue"
    }
    const { coastlines_color = "black" } = state
    return coastlines_color
}


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
