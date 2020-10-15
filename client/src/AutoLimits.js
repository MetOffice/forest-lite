import React, { useEffect } from "react"
import {
    filter,
    not,
    head,
    tail,
    compose,
    reduce,
    map,
    max,
    min
} from "ramda"


const AutoLimits = ({ source, onChange }) => {
    useEffect(() => {
        const cb = () => {
            const arrayMax = x => reduce(max, head(x), tail(x))
            const arrayMin = x => reduce(min, head(x), tail(x))
            const removeNaN = filter(compose(not, isNaN))
            const maskedArrayMin = compose(arrayMin, removeNaN)
            const maskedArrayMax = compose(arrayMax, removeNaN)

            // TODO: Abstract general dimension reduce pattern
            const imageMin = compose(
                maskedArrayMin,
                map(maskedArrayMin),
                map(map(maskedArrayMin)),
            )
            const imageMax = compose(
                maskedArrayMax,
                map(maskedArrayMax),
                map(map(maskedArrayMax)),
            )
            onChange({
                high: imageMax(source.data.image),
                low: imageMin(source.data.image),
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
