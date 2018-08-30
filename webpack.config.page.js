const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (_env, argv) => {

    const isProd = argv.mode === "production";
    const sourceOutputPath = path.join(path.resolve(__dirname), "page_dist", isProd ? "prod" : "dev");

    const entry = {};
    const staticFiles = {};

    const addStaticFile = (mappedName, sourcePath) => staticFiles[mappedName] = sourcePath;
    {
        const settingsAssets = "./assets/settings/";
        fs.readdirSync(settingsAssets).forEach(f => {
            addStaticFile(f, settingsAssets + f);
        });
    }
    addStaticFile("index.html", "./page/index.html");
    addStaticFile("features.html", "./page/features.html");
    addStaticFile("contribute.html", "./page/contribute.html");

    const addFile = f => entry[path.basename(f)] = f;
    addFile("./page/index.js");
    addFile("./page/contribute.js");
    addFile("./page/features.js");

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
            new CopyWebpackPlugin(Object.keys(staticFiles).reduce((accum, mappedName) => {
                accum.push({
                    from: staticFiles[mappedName],
                    to: path.join(sourceOutputPath, mappedName)
                });
                return accum;
            }, [])),
        ],

        devtool: "sourcemap"
    };

    return config;
}
