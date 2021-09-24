const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

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

const logo_data_b64 = "data:image/svg+xml;base64," + btoa(fs.readFileSync("./assets/logo/logo.svg", "utf8"));

module.exports = (_env, argv) => {
  const is_prod = argv.mode === "production";

  const source_output_path = path.join(
    path.resolve(__dirname), "builds", "userscript", is_prod ? "prod" : "dev"
  );

  let config = {
    performance: {
      hints: false
    },

    context: __dirname,
    node: { __filename: true, __dirname: true },
    target: "web",
    mode: is_prod ? "production" : "development",

    entry: {
      ["vttes.user.js"]: "./src/entrypoints/userscript.ts",
    },

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
      new webpack.DefinePlugin({
        "BUILD_CONSTANT_VERSION": JSON.stringify(git.version),
        "BUILD_CONSTANT_COMMIT": JSON.stringify(git.commit),
        "BUILD_CONSTANT_BRANCH": JSON.stringify(git.branch),
        "BUILD_CONSTANT_TARGET_PLATFORM": JSON.stringify("userscript"),
        "BUILD_CONSTANT_CHANGELOG": JSON.stringify(changelog),
        'BUILD_CONSTANT_VTTES_IS_DEV': JSON.stringify(is_prod === false),
        'BUILD_CONSTANT_LOGO_B64': `"${logo_data_b64}"`,
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
    ],
  };

  if(is_prod) {
    config.optimization = { 
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            output: {
              comments: false,
            },
          },
          test: /\.js$|\.jsx$|\.ts$|\.tsx$/i, 
          parallel: true,
        })
      ]
    };
  }

  return config;
};
