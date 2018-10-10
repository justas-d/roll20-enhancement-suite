const VersionNameGen = require("./VersionNameGen");
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const editorUrls = require("../src/utils/EditorURLs");

const gen = (browser, origVersionName) => {
    let manifest = {
        manifest_version: 2,
        name: 'Roll20 Enhancement Suite',
        version: VersionNameGen(origVersionName),
        description: 'Provides quality-of-life and workflow speed improvements to Roll20.',

        permissions: [
            '*://app.roll20.net/editor*',
            'webRequest',
            'webRequestBlocking',
            'storage'
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
