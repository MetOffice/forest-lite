const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = {
    entry: {
        lite: './src/index.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'FOREST Lite',
            template: path.resolve(__dirname, "src", "index.html"),
            minify: false
        })
    ],
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, "dist")
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

