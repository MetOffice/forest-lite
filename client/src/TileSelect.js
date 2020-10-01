import React from "react"
import * as Bokeh from "@bokeh/bokehjs"
import { connect } from "react-redux"
import { set_url } from "./actions.js"


let providers = {
    'Antique': 'https://cartocdn_d.global.ssl.fastly.net/base-antique/{Z}/{X}/{Y}.png',
    'Midnight Commander': 'https://cartocdn_d.global.ssl.fastly.net/base-midnight/{Z}/{X}/{Y}.png',
    'ESRI Nat Geo': 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{Z}/{Y}/{X}',
    'Voyager': 'https://d.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{Z}/{X}/{Y}.png'
}


class TileSelect extends React.Component {
    constructor(props) {
        super(props)
        let { dispatch } = props
        let select = new Bokeh.Widgets.Select({
            options: Object.keys(providers),
            sizing_mode: "stretch_width",
            value: "Voyager"
        })
        select.connect(select.properties.value.change, () => {
            dispatch(set_url(providers[select.value]))
        })
        this.state = { select }
    }
    componentDidMount() {
        const { select } = this.state
        Bokeh.Plotting.show(select, this.el)
    }
    render() {
        return <div ref={ el => this.el = el } />
    }
}

const mapStateToProps = state => ({})

export default connect(mapStateToProps)(TileSelect)
