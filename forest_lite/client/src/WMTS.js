import React from "react"
import * as Bokeh from "@bokeh/bokehjs"
import { connect } from "react-redux"
import * as R from "ramda"


const DEFAULT_URL = "https://d.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{Z}/{X}/{Y}.png"


// Web map tiling background
class WMTS extends React.Component {
    constructor(props) {
        super(props)
        const { figure } = props
        const tile_source = new Bokeh.WMTSTileSource({
            url: DEFAULT_URL
        })
        const renderer = new Bokeh.TileRenderer({tile_source: tile_source})
        figure.renderers = figure.renderers.concat(renderer)
        this.state = { tile_source }
    }
    render() {
        const { tile_source } = this.state
        const { url } = this.props
        tile_source.url = url
        return null
    }
}


const mapStateToProps = R.compose(R.pick(["url"]),
                                  R.mergeRight({ url: DEFAULT_URL }))


export default connect(mapStateToProps)(WMTS)
