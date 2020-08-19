const path = require('path')


module.exports = {
    entry: {
        lite: './src/index.js'
    },
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, "static")
    }
}

