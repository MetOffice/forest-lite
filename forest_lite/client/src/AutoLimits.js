import React, { useEffect } from "react"
import {
    filter,
    flatten,
    not,
    head,
    tail,
    compose,
    reduce,
    max,
    min
} from "ramda"


// Approx. 7ms where ramda approach is ~70ms
const fastMax = x => {
    if (x.length === 0) return undefined
    return x.reduce((p, v) => {
        return ( p > v ? p : v )
    })
}
const fastMin = x => {
    if (x.length === 0) return undefined
    return x.reduce((p, v) => {
        return ( p < v ? p : v )
    })
}

const AutoLimits = ({ source, onChange }) => {
    useEffect(() => {
        const cb = () => {
            const removeNaN = filter(compose(not, isNaN))
            const values = removeNaN(flatten(source.data.image))
            onChange({
                high: fastMax(values),
                low: fastMin(values),
            })
        }

        // BokehJS wiring
        source.connect(source.properties.data.change, cb)
        return () => {
            source.disconnect(source.properties.data.change, cb)
        }

    }, [ onChange ])
    return null
}


export default AutoLimits
