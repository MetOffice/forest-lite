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
    if (feature === "disputed") {
        return "red"
    }
    const { coastlines_color = "black" } = state
    return coastlines_color
}
