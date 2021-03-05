import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import debounce from "lodash/debounce"
import { makeOnPanZoom } from "./on-pan-zoom.js"
import { setFigure } from "./actions.js"
import { selectPorts } from "./ports-selector.js"


/**
 * Send messages with Bokeh axis extents
 */
const OnPanZoom = ({ figure }) => {
    const ports = useSelector(selectPorts)
    const dispatch = useDispatch()
    useEffect(() => {
        if (ports != null) {
            // Listen to x_range.start changes
            let eventHandler = makeOnPanZoom(figure.x_range)
            let fn = () => {

                // Set figure axis limits in application state
                const props = {
                    x_range: {
                        start: figure.x_range.start,
                        end: figure.x_range.end
                    },
                    y_range: {
                        start: figure.y_range.start,
                        end: figure.y_range.end
                    }
                }
                const action = setFigure(props)

                // Send action to Elm
                ports.receiveData.send({ label: "action", payload: action })

                // Send figure extent to React-Redux
                dispatch(action)
            }
            eventHandler(debounce(fn, 400))
        }
    }, [ JSON.stringify(ports) ])
    return null
}


export default OnPanZoom
