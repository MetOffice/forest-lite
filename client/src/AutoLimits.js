import React, { useEffect } from "react"
import { head, tail, compose, reduce, map, max, min } from "ramda"


const AutoLimits = ({ source, onChange }) => {
    useEffect(() => {
        const cb = () => {
            const arrayMax = x => reduce(max, head(x), tail(x))
            const arrayMin = x => reduce(min, head(x), tail(x))

            // TODO: Abstract general dimension reduce pattern
            const imageMin = compose(
                arrayMin,
                map(arrayMin),
                map(map(arrayMin)),
            )
            const imageMax = compose(
                arrayMax,
                map(arrayMax),
                map(map(arrayMax)),
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
