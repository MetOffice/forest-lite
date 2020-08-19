const path = require('path')


module.exports = {
    entry: {
        lite: './src/index.js'
    },
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, "static")
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            options: {
                presets: ["@babel/preset-env", "@babel/preset-react"]
            }
        }]
    }
}

