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


const AutoLimits = ({ source, onChange }) => {
    useEffect(() => {
        const cb = () => {
            const arrayMax = x => reduce(max, head(x), tail(x))
            const arrayMin = x => reduce(min, head(x), tail(x))
            const removeNaN = filter(compose(not, isNaN))
            const values = removeNaN(flatten(source.data.image))
            onChange({
                high: arrayMax(values),
                low: arrayMin(values),
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
