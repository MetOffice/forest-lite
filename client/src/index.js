import * as Redux from "redux"
import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import App from "./App.js"
import { rootReducer } from "./reducers.js"
import { toolMiddleware } from "./middlewares.js"
import {
    SET_DATASETS,
    SET_PALETTE_NAME,
    SET_PALETTE_NUMBER,
    SET_PALETTES,
    NEXT_TIME_INDEX,
    PREVIOUS_TIME_INDEX
} from "./action-types.js"
import {
    set_url,
    set_dataset,
    set_datasets,
    set_palette,
    set_palettes,
    set_palette_name,
    set_palette_names,
    set_palette_number,
    set_palette_numbers,
    set_playing,
    set_limits,
    set_time_index,
    next_time_index,
    previous_time_index,
    fetch_image,
    fetch_image_success
} from "./actions.js"
import * as Bokeh from "@bokeh/bokehjs"


// ReduxJS

// Middlewares
let logActionMiddleware = store => next => action => {
    console.log(action)
    next(action)
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
        let dataset_id = action.payload[0].id
        next(set_dataset(dataset_id))
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



window.main = function(baseURL) {
    let store = Redux.createStore(rootReducer,
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
            <App baseURL={ baseURL } />
        </Provider>,
        document.getElementById("root"))

    // Async get palette names
    fetch(`${baseURL}/palettes`)
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

    // Fetch datasets from server
    fetch(`${baseURL}/datasets`)
        .then(response => response.json())
        .then(data => data.datasets)
        .then(datasets => store.dispatch(set_datasets(datasets)))

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
    //       let url = `${baseURL}/datasets/${state.dataset}/times/${time}`
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
    //

    // Set static limits
    store.dispatch(set_limits({low: 200, high: 300}))

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
