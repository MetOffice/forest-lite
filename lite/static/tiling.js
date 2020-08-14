/**
 * Simple Web Map tile algorithm
 */
let tiling = (function() {
    let ns = {}

    /**
     * Simple renderer to process image data endpoint
     */
    ns.DataTileRenderer = function(figure, color_mapper) {
        this.figure = figure
        this.source = new Bokeh.ColumnDataSource({
            data: {
                x: [],
                y: [],
                dw: [],
                dh: [],
                image: [],
                level: []
            }
        })
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
        this.cache = {}
        let x_range = this.figure.x_range
        x_range.connect(x_range.properties.start.change, () => {
            this.render()
        })
    }
    ns.DataTileRenderer.prototype.setURL = function(url) {
        this.url = url

        // Reset image tiles
        let empty = Object.keys(this.source.data).reduce((agg, key) => {
            agg[key] = []
            return agg
        }, {})
        this.source.data = empty
        this.source.change.emit()

        // Re-render
        this.render()
    }
    ns.DataTileRenderer.prototype.render = function() {
        if (typeof this.limits === "undefined") {
            return
        }
        let x_range = this.figure.x_range
        let y_range = this.figure.y_range
        let tiles = tiling.tiles(x_range, y_range, this.limits)
        for (let i=0; i<tiles.length; i++) {
            let tile = tiles[i]
            let key = this.url.replace("{Z}", tile.z)
                              .replace("{X}", tile.x)
                              .replace("{Y}", tile.y)
            if (!(key in this.cache)) {
                this.cache[key] = true // Dummy value
                fetch(key)
                    .then((response) => response.json())
                    .then((data) => {
                        console.log(tile)
                        // Append data to source.data
                        let source = this.source
                        let updated = Object.keys(data)
                            .reduce((acc, key) => {
                                acc[key] = source.data[key]
                                    .concat(data[key])
                            return acc
                        }, {})

                        // Split into images
                        let images = Object.keys(updated)
                            .reduce((agg, key) => {
                                updated[key].forEach((array, index) => {
                                    agg[index] = agg[index] || {}
                                    agg[index][key] = array
                                })
                                return agg
                            }, [])

                        // Sort by level (in-place)
                        images = images.sort((a, b) => {
                            return a.level - b.level
                        })

                        // Combine into data object
                        let combined = images.reduce((agg, obj) => {
                            Object.keys(obj).forEach((key) => {
                                agg[key] = agg[key] || []
                                agg[key].push(obj[key])
                            })
                            return agg
                        }, {})

                        source.data = combined
                        source.change.emit()
                    })
            }
        }
    }

    /**
     * Estimate Z/X/Y tile indices related to viewport
     */
    ns.tiles = function(x_range, y_range, limits) {
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
        let level = zoomLevel(world)
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
    let interp1d = ns.interp1d = function(xLow, xHigh, yLow, yHigh) {
        let wrapped = function(x) {
            return ((yHigh - yLow) * (x - xLow)) / (xHigh - xLow)
        }
        return wrapped
    }

    // Pixel index related to zoom level
    let pixelIndex = ns.pixelIndex = function(x, level) {
        return Math.floor(x * (2**level))
    }

    // Tile index from pixel index assuming 256x256 tile
    let tileIndex = ns.tileIndex = function(pixel) {
        return Math.floor(pixel / 256)
    }

    // Optimal zoom level given world coordinates
    let zoomLevel = ns.zoomLevel = function(world) {
        // TODO: support negative
        let dx = world.x.end - world.x.start
        let dy = world.y.end - world.y.start
        let dw = Math.min(dx, dy)
        return Math.floor(Math.log2(256 / dw))
    }

    return ns
})()
