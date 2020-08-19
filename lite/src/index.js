import * as tiling from "./tiling.js"
import * as contour from "./contour.js"
import * as helpers from "@turf/helpers"
import * as Redux from "redux"
import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import App from "./App.js"
import { SET_HOVER_TOOL, TOGGLE_HOVER_TOOL } from "./action-types.js"
import { setHoverTool } from "./actions.js"


let providers = {
    'Antique': 'https://cartocdn_d.global.ssl.fastly.net/base-antique/{Z}/{X}/{Y}.png',
    'Midnight Commander': 'https://cartocdn_d.global.ssl.fastly.net/base-midnight/{Z}/{X}/{Y}.png',
    'ESRI Nat Geo': 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{Z}/{Y}/{X}',
    'Voyager': 'https://d.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{Z}/{X}/{Y}.png'
}


// Action keywords
const SET_URL = 'SET_URL'
const SET_DATASET = 'SET_DATASET'
const SET_DATASETS = 'SET_DATASETS'
const SET_PALETTE = 'SET_PALETTE'
const SET_PALETTES = 'SET_PALETTES'
const SET_PALETTE_NAME = 'SET_PALETTE_NAME'
const SET_PALETTE_NAMES = 'SET_PALETTE_NAMES'
const SET_PALETTE_NUMBER = 'SET_PALETTE_NUMBER'
const SET_PALETTE_NUMBERS = 'SET_PALETTE_NUMBERS'
const SET_PLAYING = 'SET_PLAYING'
const SET_LIMITS = 'SET_LIMITS'
const SET_TIMES = 'SET_TIMES'
const SET_TIME_INDEX = 'SET_TIME_INDEX'
const NEXT_TIME_INDEX = 'NEXT_TIME_INDEX'
const PREVIOUS_TIME_INDEX = 'PREVIOUS_TIME_INDEX'
const FETCH_IMAGE = 'FETCH_IMAGE'
const FETCH_IMAGE_SUCCESS = 'FETCH_IMAGE_SUCCESS'


// Action creators
let set_url = url => { return { type: SET_URL, payload: url } }
let set_dataset = name => { return { type: SET_DATASET, payload: name } }
let set_datasets = names => { return { type: SET_DATASETS, payload: names } }
let set_palette = name => { return { type: SET_PALETTE, payload: name } }
let set_palettes = items => { return { type: SET_PALETTES, payload: items } }
let set_palette_name = data => { return { type: SET_PALETTE_NAME, payload: data } }
let set_palette_names = data => { return { type: SET_PALETTE_NAMES, payload: data } }
let set_palette_number = data => { return { type: SET_PALETTE_NUMBER, payload: data } }
let set_palette_numbers = data => { return { type: SET_PALETTE_NUMBERS, payload: data } }
let set_playing = flag => { return { type: SET_PLAYING, payload: flag } }
let set_limits = limits => { return { type: SET_LIMITS, payload: limits } }
let set_times = times => { return { type: SET_TIMES, payload: times } }
let set_time_index = index => { return { type: SET_TIME_INDEX, payload: index } }
let next_time_index = () => { return { type: NEXT_TIME_INDEX } }
let previous_time_index = () => { return { type: PREVIOUS_TIME_INDEX } }
let fetch_image = url => { return { type: FETCH_IMAGE, payload: url } }
let fetch_image_success = () => { return { type: FETCH_IMAGE_SUCCESS } }


// ReduxJS
let reducer = (state = "", action) => {
    switch (action.type) {
        case SET_HOVER_TOOL:
            return Object.assign({}, state, {hover_tool: action.payload})
        case SET_DATASET:
            return Object.assign({}, state, {dataset: action.payload})
        case SET_DATASETS:
            return Object.assign({}, state, {datasets: action.payload})
        case SET_URL:
            return Object.assign({}, state, {url: action.payload})
        case SET_PALETTE:
            return Object.assign({}, state, {palette: action.payload})
        case SET_PALETTES:
            return Object.assign({}, state, {palettes: action.payload})
        case SET_PALETTE_NAME:
            return Object.assign({}, state, {palette_name: action.payload})
        case SET_PALETTE_NAMES:
            return Object.assign({}, state, {palette_names: action.payload})
        case SET_PALETTE_NUMBER:
            return Object.assign({}, state, {palette_number: action.payload})
        case SET_PALETTE_NUMBERS:
            return Object.assign({}, state, {palette_numbers: action.payload})
        case SET_PLAYING:
            return Object.assign({}, state, {playing: action.payload})
        case SET_LIMITS:
            return Object.assign({}, state, {limits: action.payload})
        case SET_TIMES:
            return Object.assign({}, state, {times: action.payload})
        case SET_TIME_INDEX:
            return Object.assign({}, state, {time_index: action.payload})
        case FETCH_IMAGE:
            return Object.assign({}, state, {is_fetching: true, image_url: action.payload})
        case FETCH_IMAGE_SUCCESS:
            return Object.assign({}, state, {is_fetching: false})
        default:
            return state
    }
}


// Middlewares
let logActionMiddleware = store => next => action => {
    console.log(action)
    next(action)
}

let toolMiddleware = store => next => action => {
    if (action.type === TOGGLE_HOVER_TOOL) {
        let flag
        let state = store.getState()
        if (typeof state.hover_tool === "undefined") {
            flag = true
        } else {
            flag = !state.hover_tool
        }
        next(setHoverTool(flag))
    } else {
        next(action)
    }
}

let animationMiddleware = store => next => action => {
    if (action.type === NEXT_TIME_INDEX) {
        let state = store.getState()
        if (typeof state.time_index === "undefined") {
            return
        }
        if (typeof state.times === "undefined") {
            return
        }
        let index = mod(state.time_index + 1, state.times.length)
        let action = set_time_index(index)
        next(action)
    } else if (action.type === PREVIOUS_TIME_INDEX) {
        let state = store.getState()
        if (typeof state.time_index === "undefined") {
            return
        }
        if (typeof state.times === "undefined") {
            return
        }
        let index = mod(state.time_index - 1, state.times.length)
        let action = set_time_index(index)
        next(action)
    } else {
        next(action)
    }
}

let colorPaletteMiddleware = store => next => action => {
    if (action.type == SET_PALETTE_NAME) {
        // Async get palette numbers
        let name = action.payload
        let state = store.getState()
        if (typeof state.palettes !== "undefined") {
            let numbers = state.palettes
                .filter((p) => p.name == name)
                .map((p) => parseInt(p.number))
                .concat()
                .sort((a, b) => a - b)
            let action = set_palette_numbers(numbers)
            store.dispatch(action)
        }
    }
    else if (action.type == SET_PALETTE_NUMBER) {
        // Async get palette numbers
        let state = store.getState()
        let name = state.palette_name
        let number = action.payload
        if (typeof state.palettes !== "undefined") {
            let palettes = getPalettes(state.palettes, name, number)
            if (palettes.length > 0) {
                let action = set_palette(palettes[0].palette)
                store.dispatch(action)
            }
        }
    }
    else if (action.type == SET_PALETTES) {
        // Set initial palette to Blues 256
        next(action)
        next(set_palette_name("Blues"))
        next(set_palette_number(256))
        let palettes = getPalettes(action.payload, "Blues", 256)
        if (palettes.length > 0) {
            let action = set_palette(palettes[0].palette)
            next(action)
        }
        return
    }

    return next(action)
}

let datasetsMiddleware = store => next => action => {
    next(action)
    if (action.type == SET_DATASETS) {
        let name = action.payload[0]
        next(set_dataset(name))
    }
    return
}


// Helpers
let mod = function(a, n) {
    // Always return positive number, e.g. mod(-2, 5) -> 3
    // Builtin % operator allows negatives, e.g. -2 % 5 -> -2
    return ((a % n) + n) % n
}

let getPalettes = function(palettes, name, number) {
    return palettes
        .filter((p) => p.name === name)
        .filter((p) => parseInt(p.number) === parseInt(number))
}


window.main = function() {

    // Geographical map
    let xdr = new Bokeh.Range1d({ start: 0, end: 1e6 })
    let ydr = new Bokeh.Range1d({ start: 0, end: 1e6 })
    let figure = Bokeh.Plotting.figure({
        x_range: xdr,
        y_range: ydr,
        sizing_mode: "stretch_both",
    })
    figure.xaxis[0].visible = false
    figure.yaxis[0].visible = false
    figure.toolbar_location = null
    figure.min_border = 0
    figure.select_one(Bokeh.WheelZoomTool).active = true

    // Web map tiling background
    let tile_source = new Bokeh.WMTSTileSource({
        url: "https://cartocdn_d.global.ssl.fastly.net/base-antique/{Z}/{X}/{Y}.png"
    })
    let renderer = new Bokeh.TileRenderer({tile_source: tile_source})
    figure.renderers = figure.renderers.concat(renderer)
    Bokeh.Plotting.show(figure, "#map-figure")

    let store = Redux.createStore(reducer,
                                  Redux.applyMiddleware(
                                      logActionMiddleware,
                                      toolMiddleware,
                                      animationMiddleware,
                                      colorPaletteMiddleware,
                                      datasetsMiddleware,
                                  ))
    store.subscribe(() => { console.log(store.getState()) })

    // Use React to manage components
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById("root"))

    // WMTS Map layer
    store.subscribe(() => {
        let state = store.getState()
        if (typeof state.url === "undefined") {
            return
        }
        tile_source.url = state.url
    })

    // Async get palette names
    fetch("./palettes")
        .then((response) => response.json())
        .then((data) => {
            let action = set_palettes(data)
            store.dispatch(action)
            return data
        })
        .then((data) => {
            let names = data.map((p) => p.name)
            return Array.from(new Set(names)).concat().sort()
        })
        .then((names) => {
            let action = set_palette_names(names)
            store.dispatch(action)
        })

    // WMTS select
    let selectTile = new Bokeh.Widgets.Select({
        options: Object.keys(providers)
    })
    selectTile.connect(selectTile.properties.value.change, () => {
        store.dispatch(set_url(providers[selectTile.value]))
    })
    Bokeh.Plotting.show(selectTile, "#tile-url-select")

    // Select widget
    let select = new Bokeh.Widgets.Select({
        options: [],
    })
    select.connect(select.properties.value.change, () => {
        store.dispatch({type: SET_DATASET, payload: select.value})
    })
    Bokeh.Plotting.show(select, "#select")
    store.subscribe(() => {
        let state = store.getState()
        if (typeof state.datasets === "undefined") {
            return
        }
        if (typeof state.dataset === "undefined") {
            return
        }
        select.options = state.datasets
        select.value = state.dataset
    })

    // Fetch datasets from server
    fetch("./datasets").then((response) => {
        return response.json()
    }).then((data) => {
        store.dispatch(set_datasets(data.names))
    })

    // Select palette name widget
    let palette_select = new Bokeh.Widgets.Select({
        options: []
    })
    store.subscribe(() => {
        let state = store.getState()
        if (typeof state.palette_names !== "undefined") {
            palette_select.options = state.palette_names
        }
        // palette_select.value = state.palette_name // BokehJS BUG #10211
    })
    palette_select.connect(palette_select.properties.value.change, () => {
        let action = set_palette_name(palette_select.value)
        store.dispatch(action)
    })
    Bokeh.Plotting.show(palette_select, "#palette-select")

    // Select palette number widget
    let palette_number_select = new Bokeh.Widgets.Select({
        options: []
    })
    store.subscribe(() => {
        let state = store.getState()
        if (typeof state.palette_numbers !== "undefined") {
            let options = state.palette_numbers.map((x) => x.toString())
            palette_number_select.options = options
        }
    })
    palette_number_select.connect(palette_number_select.properties.value.change, () => {
        let action = set_palette_number(palette_number_select.value)
        store.dispatch(action)
    })
    Bokeh.Plotting.show(palette_number_select, "#palette-number-select")

    // Image
    let color_mapper = new Bokeh.LinearColorMapper({
        "low": 200,
        "high": 300,
        "palette": ["#440154", "#208F8C", "#FDE724"],
        "nan_color": "rgba(0,0,0,0)"
    })

    store.subscribe(() => {
        let state = store.getState()
        if (typeof state.palette != "undefined") {
            color_mapper.palette = state.palette
        }
        if (typeof state.limits != "undefined") {
            color_mapper.low = state.limits.low
            color_mapper.high = state.limits.high
        }
    })

    // DataTileRenderer
    let tile_renderer = new tiling.DataTileRenderer(figure, color_mapper)
    store.subscribe(() => {
        let state = store.getState()
        if (typeof state.dataset === "undefined") {
            return
        }
        if (typeof state.time_index === "undefined") {
            return
        }
        if (typeof state.times === "undefined") {
            return
        }
        // Experimental tile server
        let time = state.times[state.time_index]
        let url = `./tiles/${state.dataset}/${time}/{Z}/{X}/{Y}`
        tile_renderer.setURL(url)

        // HoverTool
        if (typeof state.hover_tool === "undefined") {
            return
        } else {
            tile_renderer.tool.active = state.hover_tool
        }
    })

    // Isolines
    let contourRenderer = new contour.ContourRenderer(figure)
    store.subscribe(() => {
        let state = store.getState()
        if (typeof state.time_index === "undefined") {
            return
        }
        if (typeof state.times === "undefined") {
            return
        }
        if (typeof state.dataset === "undefined") {
            return
        }
        let timestamp_ms = state.times[state.time_index]
        let url = `./points/${state.dataset}/${timestamp_ms}`
        fetch(url)
            .then(response => response.json())
            .then((data) => {
                let lats = data.coords.latitude.data
                let lons = data.coords.longitude.data
                let values = data.data
                let points = []
                for (let i=0; i<lats.length; i++) {
                    for (let j=0; j<lons.length; j++) {
                        let point = helpers.point(
                            [lons[j], lats[i]],
                            {value: values[i][j]})
                        points.push(point)
                    }
                }
                return helpers.featureCollection(points)
            })
            .then((feature) => {
                let breaks = [280, 290, 300]
                contourRenderer.renderFeature(feature, breaks)
            })
    })

    //   // RESTful image
    //   let image_source = new Bokeh.ColumnDataSource({
    //       data: {
    //           x: [],
    //           y: [],
    //           dw: [],
    //           dh: [],
    //           image: [],
    //           url: []
    //       }
    //   })
    //   let filter = new Bokeh.IndexFilter({
    //       indices: []
    //   })
    //   let view = new Bokeh.CDSView({
    //       source: image_source,
    //       filters: []
    //   })
    //   // image_source.connect(image_source.properties.data.change, () => {
    //   //     const arrayMax = array => array.reduce((a, b) => Math.max(a, b))
    //   //     const arrayMin = array => array.reduce((a, b) => Math.min(a, b))
    //   //     let image = image_source.data.image[0]
    //   //     let low = arrayMin(image.map(arrayMin))
    //   //     let high = arrayMax(image.map(arrayMax))
    //   //     let action = set_limits({low, high})
    //   //     store.dispatch(action)
    //   // })
    //   store.dispatch(set_limits({low: 200, high: 300}))
    //   store.subscribe(() => {
    //       let state = store.getState()
    //       if (state.is_fetching) {
    //           return
    //       }
    //       if (typeof state.dataset === "undefined") {
    //           return
    //       }
    //       if (typeof state.time_index === "undefined") {
    //           return
    //       }
    //       if (typeof state.times === "undefined") {
    //           return
    //       }

    //       // Fetch image if not already loaded
    //       let time = state.times[state.time_index]
    //       let url = `./datasets/${state.dataset}/times/${time}`
    //       if (state.image_url === url) {
    //           return
    //       }

    //       let index = image_source.data["url"].indexOf(url)
    //       if (index >= 0) {
    //           view.indices = [index]
    //           return
    //       }

    //       store.dispatch(fetch_image(url))
    //       fetch(url).then((response) => {
    //           return response.json()
    //       }).then((data) => {
    //           // fix missing wiring in image_base.ts
    //           // image_source._shapes = {
    //           //     image: [
    //           //         []
    //           //     ]
    //           // }

    //           let newData = Object.keys(data).reduce((acc, key) => {
    //               acc[key] = image_source.data[key].concat(data[key])
    //               return acc
    //           }, {})
    //           newData["url"] = image_source.data["url"].concat([url])

    //           image_source.data = newData
    //           image_source.change.emit()
    //       }).then(() => {
    //           store.dispatch(fetch_image_success())
    //       })
    //   })

    //   window.image_source = image_source
    //   let glyph = figure.image({
    //       x: { field: "x" },
    //       y: { field: "y" },
    //       dw: { field: "dw" },
    //       dh: { field: "dh" },
    //       image: { field: "image" },
    //       source: image_source,
    //       view: view,
    //       color_mapper: color_mapper
    //   })

    let title = new Title(document.getElementById("title-text"))
    store.subscribe(() => {
        let state = store.getState()
        if (typeof state.time_index === "undefined") {
            return
        }
        if (typeof state.times === "undefined") {
            return
        }
        let time = new Date(state.times[state.time_index])
        title.render(time.toUTCString())
    })

    // Initial times
    store.dispatch(set_time_index(0))
    fetch('./datasets/EIDA50/times?limit=10')
        .then((response) => response.json())
        .then((data) => {
            let action = set_times(data)
            store.dispatch(action)
        })

    let frame = () => {
        let state = store.getState()
        if (state.is_fetching) {
            return
        }
        if (state.playing) {
            let action = next_time_index()
            store.dispatch(action)
        }
    }

    let row = document.getElementById("animate-controls")
    row.classList.add("btn-row")

    // Previous button
    let previousButton = new Previous({
        onClick: () => {
            let action = previous_time_index()
            store.dispatch(action)
        }
    })
    row.appendChild(previousButton.el)

    // Add Play button component
    let playButton = new Play({
        onClick: function() {
            let state = store.getState()
            // Toggle play mode
            let flag
            if (state.playing) {
                flag = false
            } else {
                flag = true
            }
            let action = set_playing(flag)
            store.dispatch(action)
        }
    })
    store.subscribe(() => {
        let state = store.getState()
        playButton.render(state.playing)
    })
    row.appendChild(playButton.el)

    // Next button
    let nextButton = new Next({
        onClick: () => {
            let action = next_time_index()
            store.dispatch(action)
        }
    })
    row.appendChild(nextButton.el)

    // Animation mechanism
    let interval = 100
    // setInterval(frame, interval)
    // setTimeout(frame, interval)
    frame()
    setInterval(frame, interval)

    // Coastlines
    let coastlines = new Lines(figure, "black")
    coastlines.fetch("./atlas/coastlines")

    // Country borders
    let borders = new Lines(figure, "black")
    borders.fetch("./atlas/borders")

    // Disputed borders
    let disputed = new Lines(figure, "red")
    disputed.fetch("./atlas/disputed")

    // Lakes
    let lakes = new Lines(figure, "LightBlue")
    lakes.fetch("./atlas/lakes")
}


/**
 * Annotate map with coastlines, borders and lake boundaries
 */
function Lines(figure, line_color) {
    this.figure = figure
    this.source = new Bokeh.ColumnDataSource({
        data: {
            xs: [[]],
            ys: [[]]
        }
    })
    this.figure.multi_line({
        xs: { field: "xs" },
        ys: { field: "ys" },
        line_color: line_color,
        source: this.source
    })
}
Lines.prototype.fetch = function(url) {
    fetch(url)
        .then(response => response.json())
        .then((data) => {
            this.source.data = data
        })
}


// Title component
function Title(el) {
    this.el = el
}
Title.prototype.render = function(message) {
    this.el.innerHTML = message
}


// Play button
function Play(props) {
    // Could replace with JSX in a React component
    this.button = document.createElement("button")
    this.button.classList.add("lite-btn", "play-btn")
    this.i = document.createElement("i")
    this.i.classList.add("fas", "fa-play")
    this.button.appendChild(this.i)
    this.button.onclick = props.onClick
    this.el = this.button
}
Play.prototype.render = function(playing) {
    let message
    if (playing) {
        // Display pause symbol
        this.i.classList.remove("fas", "fa-play")
        this.i.classList.add("fas", "fa-pause")
    } else {
        // Display play symbol
        this.i.classList.remove("fas", "fa-pause")
        this.i.classList.add("fas", "fa-play")
    }
}


// Previous button
function Previous(props) {
    let button, i
    button = document.createElement("button")
    button.classList.add("lite-btn", "previous-btn")
    button.onclick = props.onClick
    i = document.createElement("i")
    i.classList.add("fas", "fa-angle-left")
    button.appendChild(i)
    this.el = button
}


// Next button
function Next(props) {
    let button, i
    button = document.createElement("button")
    button.classList.add("lite-btn", "next-btn")
    button.onclick = props.onClick
    i = document.createElement("i")
    i.classList.add("fas", "fa-angle-right")
    button.appendChild(i)
    this.el = button
}
