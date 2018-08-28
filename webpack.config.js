const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const shell = require("shelljs");
const tmp = require('tmp');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const manifestGen = require('./browsers/ManfiestGenerator');
const browserDefinitions = require('./browsers/BrowserDefinitions');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

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

    return browsers.map((b) => {

        const entry = {};
        const staticFiles = {};

        const addSourceFolder = folder => {
            fs.readdirSync(folder).forEach(f => {
                if (fs.lstatSync(folder + f).isDirectory()) return;

                entry[f] = folder + f;
            });
        }

        const addStaticFile = (mappedName, sourcePath) => staticFiles[mappedName] = sourcePath;

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

        const settingsAssets = "./assets/settings/";
        fs.readdirSync(settingsAssets).forEach(f => {
            addStaticFile(f, settingsAssets + f);
        });

        const browser = browserDefinitions[b];
        const sourceOutputPath = path.join(path.resolve(__dirname), "builds", browser.target, isProd ? "prod" : "dev");
        const packageOutputPath = path.join(path.resolve(__dirname), "dist", browser.target, isProd ? "prod" : "dev");

        const makePng = size => {
            const tmpHandle = tmp.fileSync();
            const tempFile = tmpHandle.name;

            shell.exec(`inkscape -z --export-png ${tempFile} -h ${size} ./assets/logo.svg`);
            shell.exec(`magick convert ${tempFile} -background none -gravity center -extent ${size}x${size} ${tempFile}`);

            addStaticFile(`logo${size}.png`, tempFile);
        };

        makePng(16);
        makePng(48);
        makePng(96);
        makePng(128);

        if (browser.extraFiles) {
            for (const file of browser.extraFiles) {
                addStaticFile(path.basename(file), file);
            }
        }

        const finalManifest = manifestGen(browser);
        const gitRevision = new GitRevisionPlugin({
            branch: true,
            lightweightTags: true
        });

        console.log(entry);
        console.log(staticFiles);

        let config = {
            performance: {
                hints: false
            },

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
                        test: /(\.js|\.jsx)$/,
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
                        test: /(\.ts|\.tsx)$/,
                        loaders: ['awesome-typescript-loader']
                    },
                ],
            },

            resolve: {
                extensions: ['.tsx', '.ts', '.js', '.jsx'],
                modules: [
                    'src',
                    'node_modules',
                ],
            },

            plugins: [
                new CopyWebpackPlugin(Object.keys(staticFiles).reduce((accum, mappedName) => {
                    accum.push({
                        from: staticFiles[mappedName],
                        to: path.join(sourceOutputPath, mappedName)
                    });
                    return accum;
                }, [])),

                gitRevision,

                new webpack.DefinePlugin({
                    R20ES_VERSION: JSON.stringify(gitRevision.version()),
                    R20ES_COMMIT: JSON.stringify(gitRevision.commithash()),
                    R20ES_BRANCH: JSON.stringify(gitRevision.branch()),
                    R20ES_BROWSER: JSON.stringify(browser.target),
                    'process.env.NODE_ENV': JSON.stringify('production'),
                }),
                new GenerateJsonPlugin("manifest.json", finalManifest),
            ],

            devtool: "sourcemap"
        };

        if (isProd) {
            delete config.devtool;
            config.optimization = { minimizer: [new UglifyJsPlugin({ test: /\.js$|\.jsx$|\.ts$|\.tsx$/i, parallel: true })] };
        }

        if (wantsZip) {
            config.plugins.push(new ZipPlugin({ path: packageOutputPath, filename: `r20es_${gitRevision.version()}_${browser.id}.zip` }))
        }

        return config;
    });
}
