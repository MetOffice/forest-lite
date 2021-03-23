const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = merge(common, {
    mode: "production",
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, "static"),
        publicPath: "./static/"
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'FOREST Lite',
            template: path.resolve(__dirname, "src", "index.prod.html"),
            minify: false
        })
    ],
})
