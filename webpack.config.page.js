const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

const cfgModule = {
    rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader?babelrc=false',
                options: {
                    presets: ["@babel/preset-react"],
                    plugins: [
                        ["@babel/plugin-transform-react-jsx", {
                            "pragma": "React.createElement"
                        }],

                    ]
                }
            }],
        },
    ]
};

const getPlugins = (isProd) => {
    return [
        new webpack.DefinePlugin({
            R20ES_PAGE_PREFIX: JSON.stringify(isProd ? "/roll20-enhancement-suite" : ""),
        }),
    ];
};

module.exports = (_env, argv) => {

    const isProd = argv.mode === "production";

    const sourceOutputPath = path.join(path.resolve(__dirname), "pagerender");

    if (isProd) {
        return {
            target: "node",
            entry: { "renderPage.js": "./utils/renderPage.js" },

            output: {
                path: sourceOutputPath,
                filename: '[name]',
            },

            module: cfgModule,

            plugins: getPlugins(isProd),

            resolve: {
                extensions: ['.js'],
                modules: ['page', 'node_modules'],
            },
        }
    }

    const entry = {};
    const staticFiles = {};

    const addStaticFile = (mappedName, sourcePath) => staticFiles[mappedName] = sourcePath;
    const addStaticFolder = (folder) => {
        fs.readdirSync(folder).forEach(f => {
            addStaticFile(f, folder + f);
        });
    }

    addStaticFolder("./assets/settings/");
    addStaticFolder("./assets/site/");

    addStaticFile("r20es_1.15.15_chrome.zip", "./page/r20es_1.15.15_chrome.zip");
    addStaticFile("takedown.png", "./page/takedown.png");
    addStaticFile("index.html", "./page/index.html");
    addStaticFile("features.html", "./page/features.html");
    addStaticFile("about.html", "./page/about.html");
    addStaticFile("contribute.html", "./page/contribute.html");
    addStaticFile("chrome.html", "./page/chrome.html");
    addStaticFile("logo.svg", "./assets/logo/logo.svg");

    const addFile = f => entry[path.basename(f)] = f;
    addFile("./page/index.js");
    addFile("./page/features.js");
    addFile("./page/about.js");
    addFile("./page/contribute.js");
    addFile("./page/chrome.js");
    addStaticFile("main.css", "./page/main.css");
    addStaticFile("index.css", "./page/index.css");
    addStaticFile("features.css", "./page/features.css");

    console.log(entry);

    let config = {

        target: "web",
        entry,

        output: {
            path: sourceOutputPath,
            filename: '[name]',
        },

        module: cfgModule,

        resolve: {
            extensions: ['.js', '.jsx'],
            modules: ['page', 'node_modules'],
        },

        plugins: getPlugins(isProd).concat([
            new CopyWebpackPlugin(Object.keys(staticFiles).reduce((accum, mappedName) => {
                accum.push({
                    from: staticFiles[mappedName],
                    to: path.join(sourceOutputPath, mappedName)
                });
                return accum;
            }, [])),
        ]),
        
        devtool: "sourcemap"
    };

    return config;
}

