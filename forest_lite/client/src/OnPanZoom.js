import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import debounce from "lodash/debounce"
import { makeOnPanZoom } from "./on-pan-zoom.js"
import { setFigure } from "./actions.js"
import { selectPorts } from "./ports-selector.js"
import { toWgs84 } from "@turf/projection"
import { point } from "@turf/helpers"


/**
 * Helper function to convert from WebMercator to longitude, latitude
 */
const toLonLat = ([ x, y ]) => {
    return toWgs84(point([x, y])).geometry.coordinates
}


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

                // Send figure extent to Elm
                let [ lon_start, lat_start ] = toLonLat([
                    figure.x_range.start,
                    figure.y_range.start
                ])
                let [ lon_end, lat_end ] = toLonLat([
                    figure.x_range.end,
                    figure.y_range.end
                ])
                const actionLonLat = setFigure({
                    x_range: {
                        start: lon_start,
                        end: lon_end
                    },
                    y_range: {
                        start: lat_start,
                        end: lat_end
                    }
                })
                console.log(actionLonLat)
                ports.receiveData.send({ label: "action", payload: actionLonLat })

                // Send figure extent to React-Redux
                dispatch(action)
            }
            eventHandler(debounce(fn, 400))
        }
    }, [ ports ])
    return null
}


export default OnPanZoom
