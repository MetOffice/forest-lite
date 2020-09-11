import React from "react"
import { connect } from "react-redux"
import debounce from "lodash/debounce"
import { makeOnPanZoom } from "./on-pan-zoom.js"
import { setFigure } from "./actions.js"
import * as R from "ramda"


class OnPanZoom extends React.Component {
    componentDidMount() {
        const { figure, dispatch } = this.props

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
            dispatch(action)
        }
        eventHandler(debounce(fn, 400))
    }
    render() {
        return null
    }
}


const mapStateToProps = R.pick([]) // Always return empty object


export default connect(mapStateToProps)(OnPanZoom)
