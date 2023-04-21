const VersionNameGen = require("./VersionNameGen");
const GitRevisionPlugin = require('git-revision-webpack-plugin');

const editorUrls = [
  "https://app.roll20.net/editor",
  "https://app.roll20.net/editor/",
  "https://app.roll20.net/editor/#*", // handle all fragments
  "https://app.roll20.net/editor#*",
  "https://app.roll20.net/editor/?*", // handle all queries
  "https://app.roll20.net/editor?*"
];

const gen = (browser, origVersionName) => {
  let manifest = {
    manifest_version: 2,
    name: 'VTT Enhancement Suite',
    version: VersionNameGen(origVersionName),
    description: 'aka R20ES. Provides quality-of-life and workflow speed improvements to Roll20.',

    permissions: [
      '*://app.roll20.net/editor/',
      '*://app.roll20.net/editor',
      '*://app.roll20.net/editor?*',
      '*://app.roll20.net/editor#*',
      '*://cdn.roll20.net/*',
      'webRequest',
      'webRequestBlocking',
      'storage',
    ],
    icons: {
      "16": "logo16.png",
      "48": "logo48.png",
      "96": "logo96.png",
      "128": "logo128.png"
    },
    content_scripts: [
      {
        matches: editorUrls,
        js: [
          'ContentScript.js'
        ]
      },

      {
        matches: editorUrls,
        js: [
          "EarlyContentScript.js",
        ],
        run_at: "document_start"
      },
    ],
    background: {
      scripts: [
        'Background.js'
      ]
    },

    browser_specific_settings: {
      gecko: {
        id: '{ffed5dfa-f0e1-403d-905d-ac3f698660a7}',
      }
    },

    web_accessible_resources: [
      '*.tsx',
      '*.ts',
      '*.js',
      '*.css',
      'logo.svg',
      '*.png',
      '*.webm'
    ]
  }

  if (browser.id === "chrome") {
    manifest.version_name = origVersionName;
  }

  return Object.assign(manifest, browser.manifest);
}

module.exports = gen;
