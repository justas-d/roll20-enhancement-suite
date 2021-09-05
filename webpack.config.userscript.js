const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin');

let git = {};

{
  let gitPlugin = new GitRevisionPlugin({
    branch: true,
    lightweightTags: true
  });

  git.version = gitPlugin.version();
  git.commit = gitPlugin.commithash();
  git.branch = gitPlugin.branch();
}

let changelog = '';

{
  const changelogFile = "changelog.json";

  if(!fs.existsSync(changelogFile)) {
    console.log(`couldn't find ${changelogFile}`);
    process.exit(1);
  }

  changelog = fs.readFileSync(changelogFile, "utf8");
}

module.exports = (_env, argv) => {
  const is_prod = false;

  const source_output_path = path.join(
    path.resolve(__dirname), "builds", "userscript", is_prod ? "prod" : "dev"
  );

  const entry = {};
  const staticFiles = {};

  const add_static_file = (mappedName, sourcePath) => staticFiles[mappedName] = sourcePath;
  const add_entry_point = (mappedName, sourcePath) => entry[mappedName] = sourcePath;

  const add_static_folder = (root) => {
    fs.readdirSync(root).forEach(f => {
      const rootFile = root + f;
      if (fs.lstatSync(rootFile).isDirectory()) {
        return;
      }
      add_static_file(f, rootFile);
    });
  };

  add_static_folder("./css/");
  add_static_folder("./assets/logo/");
  add_entry_point("userscript.js", "./src/userscript.ts");

  /*
  {
    const root = "./src/modules/";
    fs.readdirSync(root).forEach(dirname => {
      const rootDirname = root + dirname;
      if (!fs.lstatSync(rootDirname).isDirectory()) return;

      // look for the entry point
      const entryRegex = /Module(\.js.?$|\.ts.?$)/i;
      fs.readdirSync(rootDirname).forEach(f => {
        if (!f.match(entryRegex)) {
          return;
        }

        add_entry_point(dirname + ".js", "./" + path.join(root, dirname, f));
      });
    });
  }
  */

  /*
  {
    const root = "./src/entrypoints/"
    fs.readdirSync(root).forEach(f => {
      const rootFile = root + f;
      if(fs.lstatSync(rootFile).isDirectory()) {
        return;
      }

      add_entry_point(f, rootFile);
    });
  }
  */

  // NOTE(justasd): only if we're doing firefox, as ff needs the dialog polyfill
  //if (browser.extraFiles) {
  //  for (const file of browser.extraFiles) {
  //    add_static_file(path.basename(file), file);
  //  }
  //}

    console.log(entry);
    console.log(staticFiles);

  let config = {
    performance: {
      hints: false
    },

    context: __dirname,
    node: { __filename: true, __dirname: true },
    target: "web",
    mode: is_prod ? "production" : "development",

    entry: entry,

    output: {
      path: source_output_path,
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
                [
                  'transform-define', 
                  {
                    'process.env.BUILD_TARGET': "chrome",
                    'process.env.NODE_ENV': is_prod ? "production" : "development",
                  }
                ],
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
          to: path.join(source_output_path, mappedName)
        });
        return accum;
      }, [])),

      new webpack.DefinePlugin({
        "build.R20ES_VERSION": JSON.stringify(git.version),
        "build.R20ES_COMMIT": JSON.stringify(git.commit),
        "build.R20ES_BRANCH": JSON.stringify(git.branch),
        "build.R20ES_BROWSER": JSON.stringify("chrome"),
        "VTTES_BROWSER": JSON.stringify("chrome"),
        "build.R20ES_CHANGELOG": JSON.stringify(changelog),
        'build_R20ES_IS_DEV': JSON.stringify(is_prod === false),
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
    ],
  };

  if(is_prod) {
    config.optimization = { 
      minimizer: [new UglifyJsPlugin({ test: /\.js$|\.jsx$|\.ts$|\.tsx$/i, parallel: true })] 
    };
  }

  return config;
};
