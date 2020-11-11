/**
 * Simple Web Map tile algorithm
 */

// NOTE: y extents slightly different to x extents
export const WEB_MERCATOR_EXTENT = {
    x: [-20037508.342789244, 20037508.342789244],
    y: [ -20037508.342789255, 20037508.342789244 ]
}


const _cache = {}

// Render tiles
export const renderTiles = source => urls => {
    const promises = urls.map(url => {
        if (url in _cache) {
            return Promise.resolve(_cache[url])
        } else {
            return fetch(url)
                .then(response => response.json())
                .then(data => data.data)
                .then(data => {
                    _cache[url] = data
                    return data
                })
        }
    })
    return Promise.all(promises)
        .then(images => images.reduce(imageReducer, {
            x: [],
            y: [],
            dw: [],
            dh: [],
            image: []
        }))
        .then(data => {
            source.data = data
            source.change.emit()
        })
}

// Interpolate URL from tile parameters
export const getURL = (url, x, y, z) => {
    return url.replace("{X}", x)
              .replace("{Y}", y)
              .replace("{Z}", z)
}


// Reduce (collection, image) => collection
export const imageReducer = (agg, obj) => {
    Object.keys(obj).forEach((key) => {
        agg[key] = agg[key] || []
        agg[key] = agg[key].concat(obj[key])
    })
    return agg
}


/**
 * Find appropriate zoom level
 */
export const findZoomLevel = (x_range, y_range, limits, extraZoom = 2) => {
    let world = worldCoordinates(x_range, y_range, limits)
    return zoomLevel(world) + extraZoom
}


/**
 * Estimate Z/X/Y tile indices related to viewport
 */
export let getTiles = function(x_range, y_range, limits, level) {
    let world = worldCoordinates(x_range, y_range, limits)

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

    // Remove impossible tiles
    tiles = tiles
        .map(({x, y, z}) => [x, y, z])
        .filter(validTile)
        .map(([x, y, z]) => ({x, y, z}))
    return tiles
}

export const validTile = ([x, y, z]) => ((x < 2**z) && (y < 2**z))

// World coordinates in Google Maps API terminology
export const worldCoordinates = (x_range, y_range, limits) => {
    let interpX = interp1d(limits.x[0], limits.x[1], 0, 256)
    let interpY = interp1d(limits.y[0], limits.y[1], 0, 256)
    return {
        x: {
            start: interpX(x_range.start),
            end: interpX(x_range.end)
        },
        y: {
            start: interpY(y_range.start),
            end: interpY(y_range.end)
        }
    }
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
export let zoomLevel = function(extent) {
    return Math.floor(Math.log2(256 / viewportSize(extent)))
}

// Estimate viewport size
export const viewportSize = ({ x, y }) => {
    // TODO: support negative
    let dx = x.end - x.start
    let dy = y.end - y.start
    return Math.sqrt(dx**2 + dy**2)
}
