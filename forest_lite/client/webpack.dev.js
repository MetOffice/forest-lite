const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = merge(common, {
    mode: "development",
    plugins: [
        new HtmlWebpackPlugin({
            title: 'FOREST Lite (Dev)',
            template: path.resolve(__dirname, "src", "index.dev.html"),
            minify: false
        })
    ],
})
