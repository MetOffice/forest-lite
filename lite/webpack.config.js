const path = require('path')


module.exports = {
    entry: {
        script: './src/script.js'
    },
    output: {
        path: path.resolve(__dirname, "static")
    }
}

