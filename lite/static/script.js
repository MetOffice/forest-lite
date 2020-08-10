let main = function() {
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

    // AJAX source
    let source = new Bokeh.AjaxDataSource({
        data_url: "/data/takm4p4/air_temperature",
        method: "GET"
    })
    source.data = {x: [], y: []}
    figure.circle({x: {field: "x"}, y: {field: "y"}, source: source, size: 20})

    // ReduxJS
    let reducer = (state = "", action) => {
        switch (action.type) {
            case 'SET_DATASET':
                return Object.assign({}, state, {dataset: action.payload})
            case 'SET_URL':
                return Object.assign({}, state, {url: action.payload})
            case 'SET_PALETTE':
                return Object.assign({}, state, {palette: action.payload})
            case 'SET_PALETTES':
                return Object.assign({}, state, {palettes: action.payload})
            case 'SET_PALETTE_NAME':
                return Object.assign({}, state, {palette_name: action.payload})
            case 'SET_PALETTE_NAMES':
                return Object.assign({}, state, {palette_names: action.payload})
            case 'SET_PALETTE_NUMBER':
                return Object.assign({}, state, {palette_number: action.payload})
            case 'SET_PALETTE_NUMBERS':
                return Object.assign({}, state, {palette_numbers: action.payload})
            case 'SET_LIMITS':
                return Object.assign({}, state, {limits: action.payload})
            default:
                return state
        }
    }

    let colorPalette = store => next => action => {
        console.log(action)
        if (action.type == "SET_PALETTE_NAME") {
            // Async get palette numbers
            let name = action.payload
            let state = store.getState()
            if (typeof state.palettes !== "undefined") {
                let numbers = state.palettes
                    .filter((p) => p.name == name)
                    .map((p) => parseInt(p.number))
                    .concat()
                    .sort((a, b) => a - b)
                let action = {
                    type: "SET_PALETTE_NUMBERS",
                    payload: numbers
                }
                store.dispatch(action)
            }
        }
        else if (action.type == "SET_PALETTE_NUMBER") {
            // Async get palette numbers
            let state = store.getState()
            let name = state.palette_name
            let number = action.payload
            if (typeof state.palettes !== "undefined") {
                let palettes = state.palettes
                    .filter((p) => p.name === name)
                    .filter((p) => parseInt(p.number) === parseInt(number))
                if (palettes.length > 0) {
                    let action = {
                        type: "SET_PALETTE",
                        payload: palettes[0].palette
                    }
                    store.dispatch(action)
                }
            }
        }

        return next(action)
    }

    let store = Redux.createStore(reducer,
                                  Redux.applyMiddleware(colorPalette))
    store.subscribe(() => { console.log(store.getState()) })
    store.subscribe(() => {
        dataset = store.getState().dataset
        source.data_url = `./data/${dataset}/air_temperature`
        source.get_data(source.mode,
                        source.max_size,
                        source.if_modified)
    })
    store.subscribe(() => {
        let url = store.getState().url
        if (typeof url === "undefined") {
            return
        }
        tile_source.url = url
    })

    // Async get palette names
    fetch("./palettes")
        .then((response) => response.json())
        .then((data) => {
            let action = {type: "SET_PALETTES", payload: data}
            store.dispatch(action)
            return data
        })
        .then((data) => {
            let names = data.map((p) => p.name)
            return Array.from(new Set(names)).concat().sort()
        })
        .then((names) => {
            let action = {type: "SET_PALETTE_NAMES", payload: names}
            store.dispatch(action)
        })

    // Wire-up form on-click
    let button = document.getElementById("tile-url-button")
    button.onclick = () => {
        let el = document.getElementById("tile-url-select")
        store.dispatch({type: "SET_URL", payload: el.value})
    }

    // Select widget
    let select = new Bokeh.Widgets.Select({
        options: [],
    })
    fetch("./datasets").then((response) => {
        return response.json()
    }).then((data) => {
        select.options = data
    })
    select.connect(select.properties.value.change, () => {
        store.dispatch({type: "SET_DATASET", payload: select.value})
    })
    Bokeh.Plotting.show(select, "#select")


    // Select palette name widget
    let palette_select = new Bokeh.Widgets.Select({
        options: []
    })
    store.subscribe(() => {
        let state = store.getState()
        if (typeof state.palette_names !== "undefined") {
            palette_select.options = state.palette_names
        }
    })
    palette_select.connect(palette_select.properties.value.change, () => {
        let payload = palette_select.value
        store.dispatch({type: "SET_PALETTE_NAME", payload: payload})
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
        let payload = palette_number_select.value
        store.dispatch({type: "SET_PALETTE_NUMBER", payload: payload})
    })
    Bokeh.Plotting.show(palette_number_select, "#palette-number-select")

    // Image
    let color_mapper = new Bokeh.LinearColorMapper({
        "low": 200,
        "high": 300,
        "palette": ["#440154", "#208F8C", "#FDE724"]
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

    // RESTful image
    let image_source = new Bokeh.ColumnDataSource({
        data: {
            x: [],
            y: [],
            dw: [],
            dh: [],
            image: []
        }
    })
    image_source.connect(image_source.properties.data.change, () => {
        const arrayMax = array => array.reduce((a, b) => Math.max(a, b))
        const arrayMin = array => array.reduce((a, b) => Math.min(a, b))
        let image = image_source.data.image[0]
        let low = arrayMin(image.map(arrayMin))
        let high = arrayMax(image.map(arrayMax))
        let payload = {low, high}
        store.dispatch({type: "SET_LIMITS", payload: payload})
    })
    window.image_source = image_source
    store.subscribe(() => {
        let state = store.getState()
        if (typeof state.dataset === "undefined") {
            return
        }
        let url = `./image/${state.dataset}`
        fetch(url).then((response) => {
            return response.json()
        }).then((data) => {
            // fix missing wiring in image_base.ts
            image_source._shapes = {
                image: [
                    []
                ]
            }
            image_source.data = data
            image_source.change.emit()
        })
    })
    figure.image({
        x: { field: "x" },
        y: { field: "y" },
        dw: { field: "dw" },
        dh: { field: "dh" },
        image: { field: "image" },
        source: image_source,
        color_mapper: color_mapper
    })

}
