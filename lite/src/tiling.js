/**
 * Simple Web Map tile algorithm
 */

/**
 * Simple renderer to process image data endpoint
 */
export let DataTileRenderer = function(figure, color_mapper, source) {
    this.figure = figure
    if (typeof source === "undefined") {
        source = new Bokeh.ColumnDataSource({
            data: {
                x: [],
                y: [],
                dw: [],
                dh: [],
                image: [],
                level: []
            }
        })
    }
    this.source = source
    figure.image({
        x: { field: "x" },
        y: { field: "y" },
        dw: { field: "dw" },
        dh: { field: "dh" },
        image: { field: "image" },
        source: this.source,
        color_mapper: color_mapper
    })

    // Example URL pattern
    this.url = "/tiles/dataset/time/{Z}/{X}/{Y}"

    // Google WebMercator limits
    fetch("/google_limits")
        .then(response => response.json())
        .then((data) => {
            this.limits = data // TODO: Use consts
    })

    // Connect to x-range change
    this.tileCache = {}
    this.imageCache = {}
    let x_range = this.figure.x_range
    x_range.connect(x_range.properties.start.change, () => {
        this.render()
    })
}
DataTileRenderer.prototype.setURL = function(url) {
    if (url === this.url) {
        return
    }
    this.url = url

    // Reset image tiles
    let empty = Object.keys(this.source.data).reduce((agg, key) => {
        agg[key] = []
        return agg
    }, {})
    this.source.data = empty
    this.source.change.emit()

    // Empty tile cache
    this.tileCache = {}

    // Re-render
    this.render()
}
DataTileRenderer.prototype.render = function() {
    if (typeof this.limits === "undefined") {
        return
    }
    let x_range = this.figure.x_range
    let y_range = this.figure.y_range
    let tiles = getTiles(x_range, y_range, this.limits)
    let urls = {
        remote: [],
        local: []
    }
    for (let i=0; i<tiles.length; i++) {
        let tile = tiles[i]
        let key = this.url.replace("{Z}", tile.z)
                          .replace("{X}", tile.x)
                          .replace("{Y}", tile.y)
        if (!(key in this.tileCache)) {
            this.tileCache[key] = true // Dummy value
            if (key in this.imageCache) {
                urls.local.push(key)
            } else {
                urls.remote.push(key)
            }
        }
    }

    // Local images
    let images = urls.local.map((url) => {
        return this.imageCache[url]
    })
    if (images.length > 0) {
        this._addImages(images)
    }

    // Remote images
    urls.remote.forEach((url) => {
        // Fetch from server
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                this.imageCache[url] = data
                this._addImage(data)
            })
    })
}

// Concat image(s) onto source
DataTileRenderer.prototype._addImages = function(images) {
    let source = this.source

    // Split source.data into array
    let currentImages = this.splitImages(source.data)

    // Concat incoming images
    let allImages = currentImages.concat(images)

    // Sort by level (in-place)
    allImages = allImages.sort((a, b) => {
        return a.level[0] - b.level[0]
    })

    // Combine into source.data object
    let data = this.mergeImages(allImages)

    source.data = data
    source.change.emit()
}

// Append single image onto source
DataTileRenderer.prototype._addImage = function(data) {
    // Append data to source.data
    let source = this.source
    let updated = Object.keys(data)
        .reduce((acc, key) => {
            acc[key] = source.data[key]
                .concat(data[key])
        return acc
    }, {})

    // Split into images
    let images = this.splitImages(updated)

    // Sort by level (in-place)
    images = images.sort((a, b) => {
        return a.level[0] - b.level[0]
    })

    // Combine into source.data object
    let combined = this.mergeImages(images)

    source.data = combined
    source.change.emit()
}

DataTileRenderer.prototype.splitImages = function(data) {
    // Map from {image: []} to [{image: []}, {image: []}]
    return Object.keys(data)
        .reduce((agg, key) => {
            data[key].forEach((array, index) => {
                agg[index] = agg[index] || {}
                agg[index][key] = [array]
            })
            return agg
        }, [])
}
DataTileRenderer.prototype.mergeImages = function(images) {
    return images.reduce((agg, obj) => {
        Object.keys(obj).forEach((key) => {
            agg[key] = agg[key] || []
            agg[key] = agg[key].concat(obj[key])
        })
        return agg
    }, {})
}

/**
 * Estimate Z/X/Y tile indices related to viewport
 */
export let getTiles = function(x_range, y_range, limits) {
    // World coordinates in Google Maps API terminology
    let interpX = interp1d(limits.x[0], limits.x[1], 0, 256)
    let interpY = interp1d(limits.y[0], limits.y[1], 0, 256)
    let world = {
        x: {
            start: interpX(x_range.start),
            end: interpX(x_range.end)
        },
        y: {
            start: interpY(y_range.start),
            end: interpY(y_range.end)
        }
    }
    let level = zoomLevel(world) + 2
    // Calculate {Z} {X} {Y} values
    let indices = {
        x: {
            start: tileIndex(pixelIndex(world.x.start, level)),
            end: tileIndex(pixelIndex(world.x.end, level)),
        },
        y: {
            start: tileIndex(pixelIndex(world.y.start, level)),
            end: tileIndex(pixelIndex(world.y.end, level)),
        },
    }
    let tiles = []
    for (let i=indices.x.start; i<=indices.x.end; i++) {
        for (let j=indices.y.start; j<=indices.y.end; j++) {
            tiles.push({
                z: level,
                x: i,
                y: j,
            })
        }
    }
    return tiles
}

// Simple 1d interpolator
export let interp1d = function(xLow, xHigh, yLow, yHigh) {
    let wrapped = function(x) {
        return ((yHigh - yLow) * (x - xLow)) / (xHigh - xLow)
    }
    return wrapped
}

// Pixel index related to zoom level
export let pixelIndex = function(x, level) {
    return Math.floor(x * (2**level))
}

// Tile index from pixel index assuming 256x256 tile
export let tileIndex = function(pixel) {
    return Math.floor(pixel / 256)
}

// Optimal zoom level given world coordinates
export let zoomLevel = function(world) {
    // TODO: support negative
    let dx = world.x.end - world.x.start
    let dy = world.y.end - world.y.start
    let dw = Math.min(dx, dy)
    return Math.floor(Math.log2(256 / dw))
}
