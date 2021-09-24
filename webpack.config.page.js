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
    {
      test: /(\.ts|\.tsx)$/,
      use: [{
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: "tsconfig-page.json"
        }
      }]
    },
  ]
};

const getPlugins = (isProd) => {
  let latest_chrome_version = fs.readFileSync('page/latest_chrome_version', 'utf8');
  console.log("latest_chrome_version:", latest_chrome_version);

  let chrome_last_update_time = fs.readFileSync('page/chrome_last_update_time', 'utf8');
  console.log("chrome_last_update_time:", chrome_last_update_time);

  return [
    new webpack.DefinePlugin({
      R20ES_PAGE_PREFIX: JSON.stringify(isProd ? "/roll20-enhancement-suite" : ""),
      "VTTES_BROWSER": JSON.stringify("none"),
      "LATEST_CHROME_VERSION": JSON.stringify(latest_chrome_version),
      "CHROME_LAST_UPDATE_TIME": JSON.stringify(chrome_last_update_time),
      "BUILD_CONSTANT_TARGET_PLATFORM" : JSON.stringify("page"),
    }),
  ];
};

module.exports = (_env, argv) => {
  const isProd = argv.mode === "production";

  const sourceOutputPath = path.join(path.resolve(__dirname), "pagerender");

  if(isProd) {
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
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
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

  addStaticFile("latest_chrome_version", "./page/latest_chrome_version");
  addStaticFile("takedown.png", "./page/takedown.png");
  addStaticFile("patreon.webp", "./page/patreon.webp");
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
  addFile("./page/chrome.js");
  addStaticFile("tags.js", "./page/tags.js");
  addStaticFile("main.css", "./page/main.css");
  addStaticFile("index.css", "./page/index.css");
  addStaticFile("features.css", "./page/features.css");

  let config = {

    target: "web",
    entry,

    output: {
      path: sourceOutputPath,
      filename: '[name]',
    },

    module: cfgModule,

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
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

