const path = require('path')


module.exports = {
    entry: {
        lite: './src/index.js'
    },
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, "../server/static")
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ["style-loader", "css-loader"]
        }, {
            test: /\.js$/,
            loader: "babel-loader",
            options: {
                sourceType: "unambiguous",
                presets: ["@babel/preset-env", "@babel/preset-react"],
                plugins: [
                    ["@babel/plugin-transform-runtime", { regenerator: true }],
                    "@babel/plugin-proposal-export-namespace-from"
                ]
            }
        }]
    }
}

