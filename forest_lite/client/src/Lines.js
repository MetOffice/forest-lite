import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
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


export const DisputedBorders = ({ figure }) => {
    return <NaturalEarthFeature figure={ figure } feature="disputed" />
}


/**
 * Annotate map with coastlines, borders and lake boundaries
 */
export const NaturalEarthFeature = ({ figure, feature }) => {
    const [ source, setSource ] = useState(null)
    const [ renderer, setRenderer ] = useState(null)

    const active = useSelector(selectActive)
    const quadkeys = useSelector(selectQuadkeys)
    const data = useSelector(selectData(feature))
    const line_color = useSelector(selectLineColor(feature))
    const line_width = useSelector(selectLineWidth(feature))

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
            line_width: line_width,
            source: source,
        })
        renderer.level = "overlay" // NOTE: only prop assignment works

        // Update component state
        setSource(source)
        setRenderer(renderer)

    }, [])

    // Only render coastlines if quadkeys or data length changes
    useEffect(() => {
        if (source != null) {
            source.data = data
        }
    }, [ JSON.stringify(quadkeys), dataLength(data) ])

    // Render application state
    if (renderer != null) {
        renderer.visible = active
        renderer.glyph.line_color = line_color
        renderer.glyph.line_width = line_width
    }

    return null
}


const selectActive = state => {
    const { coastlines: active = true } = state
    return active
}

const empty = () => {
    return {
        xs: [[]],
        ys: [[]]
    }
}

// Multiline ColumnDataSource length (crude implementation)
const dataLength = data => {
    if (data == null) {
        return 0
    } else if (data.xs == null) {
        return 0
    } else {
        return data.xs.length
    }
}

// Select NaturalEarthFeature quadkeys
export const selectQuadkeys = state => {
    const { natural_earth_features = null } = state
    if (natural_earth_features == null) {
        return []
    } else {
        return Object.keys(natural_earth_features)
    }
}

export const selectData = feature => state => {
    const { natural_earth_features = null } = state
    if (natural_earth_features == null) {
        return empty()
    } else {
        let quadkeys = Object.keys(natural_earth_features)
        if (quadkeys.length === 0) {
            return empty()
        }
        let dataList = quadkeys.map(quadkey => {
            return natural_earth_features[quadkey]
        })
            .filter(features => features != null)
            .map(features => {
                return features[feature] || empty()
            })
        if (dataList.length === 0) {
            return empty()
        }
        return dataList.reduce(multilineReducer, {})
    }
}

const multilineReducer = (acc, lines) => {
    Object.keys(lines).map(key => {
        if (!(key in acc)) {
            acc[key] = []
        }
        acc[key] = acc[key].concat(lines[key])
    })
    return acc
}

const selectLineColor = feature => state => {
    if (feature === "lakes") {
        return "LightBlue"
    }
    if (feature === "disputed") {
        return "red"
    }
    const { coastlines_color = "black" } = state
    return coastlines_color
}

const selectLineWidth = feature => state => {
    const { coastlines_width = 1 } = state
    return coastlines_width
}
