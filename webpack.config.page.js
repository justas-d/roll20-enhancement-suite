const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (_env, argv) => {

    const isProd = argv.mode === "production";
    const sourceOutputPath = path.join(path.resolve(__dirname), "page_dist", isProd ? "prod" : "dev");

    const entry = {};

    const addFile = f => entry[path.basename(f)] = f;
    addFile("./page/index.js");

    console.log(entry);

    let config = {

        target: "web",
        entry,

        output: {
            path: sourceOutputPath,
            filename: '[name]',
        },

        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        { loader: "style-loader" },
                        { loader: "css-loader" }
                    ]
                },
                {
                    test: /(\.js|\.jsx)$/,
                    exclude: /node_modules/,
                    use: [{
                        loader: 'babel-loader?babelrc=false',
                        options: {
                            presets: ["@babel/preset-react"],
                            plugins: [
                                ['transform-define', {
                                    'process.env.NODE_ENV': argv.mode,
                                }],
                                ["@babel/plugin-transform-react-jsx", {
                                    "pragma": "React.createElement"
                                }],
                            ]
                        }
                    }],
                },
                { test: /\.(svg|png|jpg|jpeg|gif)$/, loader: 'file-loader' },

            ],
        },

        resolve: {
            extensions: ['.js', '.jsx'],
            modules: ['page', 'node_modules'],
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: './page/index.html',
            })
        ],

        devtool: "sourcemap"
    };

    return config;
}
