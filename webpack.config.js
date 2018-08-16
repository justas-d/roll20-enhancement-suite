const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin');

let entry = {};
let staticFiles = {};

const addSourceFolder = folder => {
    fs.readdirSync(folder).forEach(f => {
        if (fs.lstatSync(folder + f).isDirectory()) return;

        entry[f] = folder + f;
    });
}

const addStaticFile = (mappedName, sourcePath) => {
    staticFiles[mappedName] = sourcePath;
}

const addStaticFolder = folder => {
    fs.readdirSync(folder).forEach(f => {
        const path = folder + f;
        if (fs.lstatSync(path).isDirectory()) return;
        addStaticFile(f, path);
    });
}


addSourceFolder("./src/");
addSourceFolder("./src/modules/");

addStaticFolder("./thirdparty/");
addStaticFolder("./css/");

addStaticFile("icon.svg", "./assets/icon.svg");

const browserData = {
    "firefox": {
        target: "firefox",
        manifest: "./manifests/firefox.json"
    },
}

module.exports = (_env, argv) => {
    let env = _env || {};

    const browsers = env.browsers && env.browsers.split(',');
    if (!browsers || browsers.length <= 0) {
        console.error("CLI arg --env.browsers with valid values expected but not found.");
        process.exit(1);
    }

    const isProd = argv.mode === "production";
    const wantsZip = "zip" in env && env.zip;

    console.log(browsers);
    return browsers.map(b => {
        const browser = browserData[b];

        const sourceOutputPath = path.join(path.resolve(__dirname), "builds", browser.target, isProd ? "prod" : "dev");
        const packageOutputPath = path.join(path.resolve(__dirname), "dist", browser.target, isProd ? "prod" : "dev");

        addStaticFile("manifest.json", browser.manifest);

        let config = {
            context: __dirname,
            node: { __filename: true },
            target: "web",

            entry: entry,

            output: {
                path: sourceOutputPath,
                filename: '[name]',
            },

            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: [{
                            loader: 'babel-loader',
                            options: {
                                plugins: [
                                    ['transform-define', {
                                        'process.env.BUILD_TARGET': browser.target,
                                        'process.env.NODE_ENV': argv.mode,
                                    }],
                                ]
                            }
                        }],
                    },
                ],
            },

            resolve: {
                extensions: ['.js', '.jsx'],
                modules: [
                    'src',
                    'node_modules',
                ],
            },

            plugins: [
                new CopyWebpackPlugin(Object.keys(staticFiles).reduce((accum, mappedName) => {
                    const sourcePath = staticFiles[mappedName];
                    accum.push({ from: sourcePath, to: path.join(sourceOutputPath, mappedName) });
                    return accum;
                }, [])),
                new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production'), }),
            ],

            devtool: 'sourcemap',
        };

        if (wantsZip) {
            config.plugins.push(new ZipPlugin({ path: packageOutputPath, filename: "r20es.zip" }))
        }

        return config;
    });
}
