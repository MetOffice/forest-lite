// const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
const path = require('path')


module.exports = {
    entry: {
        lite: './src/index.js'
    },
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, "static")
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        // plugins: [
        //     new TsconfigPathsPlugin()
        // ]
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
        }, {
            test: /\.tsx?$/,
            use: 'awesome-typescript-loader',
            exclude: /node_modules/
        }]
    }
}

