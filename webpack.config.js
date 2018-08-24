const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin')

const gitRevision = new GitRevisionPlugin();

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

addStaticFolder("./css/");
addStaticFile("logo.svg", "./assets/logo.svg");

const browserData = {
    "firefox": {
        target: "firefox",
        manifest: "./manifests/firefox.json",
        extraFiles: [
            "./thirdparty/dialog-polyfill/dialog-polyfill.css",
            "./thirdparty/dialog-polyfill/dialog-polyfill.js"
        ]
    },

    "chrome": {
        target: "chrome",
        manifest: "./manifests/chrome.json"
    }
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

        if (browser.extraFiles) {
            for (const file of browser.extraFiles) {
                addStaticFile(path.basename(file), file);
            }
        }

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
                    {
                        test: /\.ts?$/,
                        use: { loader: 'awesome-typescript-loader' }
                    },
                ],
            },

            resolve: {
                extensions: ['.tx', '.js'],
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

                new GitRevisionPlugin({
                    branch: true,
                    lightweightTags: true
                }),

                new webpack.DefinePlugin({
                    R20ES_VERSION: JSON.stringify(gitRevision.version()),
                    R20ES_COMMIT: JSON.stringify(gitRevision.commithash()),
                    R20ES_BRANCH: JSON.stringify(gitRevision.branch()),
                    R20ES_BROWSER: JSON.stringify(browser.target),
                    'process.env.NODE_ENV': JSON.stringify('production'),
                }),
            ],

            devtool: 'sourcemap',
        };

        if (wantsZip) {
            config.plugins.push(new ZipPlugin({ path: packageOutputPath, filename: "r20es.zip" }))
        }

        return config;
    });
}
