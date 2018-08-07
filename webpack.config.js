const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

let entry = {};

function registerFolder(folder) {
    fs.readdirSync(folder).forEach(f => {
        if(!f.endsWith(".js")) return;
        const name = f.slice(0, -3);

        entry[name] = folder + f;
    });
}

registerFolder("./src/");
registerFolder("./src/modules/");

module.exports = {
    context: __dirname,
    node: { __filename: true},
    
    entry: entry,
    output: {
        // This copies each source entry into the extension dist folder named
        // after its entry config key.
        path: path.join(path.resolve(__dirname), 'src', 'static', 'js'),
        filename: '[name].js',
    },
    module: {
        // This transpiles all code (except for third party modules) using Babel.
        rules: [{
            exclude: /node_modules/,
            test: /\.js$/,
            // Babel options are in .babelrc
            use: ['babel-loader'],
        }],
    },
    resolve: {
        // This allows you to import modules just like you would in a NodeJS app.
        extensions: ['.js', '.jsx'],
        modules: [
            'src',
            'node_modules',
        ],
    },
    plugins: [
        // Since some NodeJS modules expect to be running in Node, it is helpful
        // to set this environment var to avoid reference errors.
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
    ],
    // This will expose source map files so that errors will point to your
    // original source files instead of the transpiled files.
    devtool: 'sourcemap',
};
