const path = require('path')
const elmSource = path.resolve(__dirname, "src/elm-app")


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
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ["style-loader", "css-loader"]
        }, {
            test: /worker\.js$/,
            use: { loader: "worker-loader" }
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
        }, {
            test: /\.elm$/,
            exclude: [ /elm-stuff/, /node_modules/ ],
            use: {
                loader: 'elm-webpack-loader',
                options: {
                    cwd: elmSource,
                    debug: false
                }
            }
        }]
    }
}

