const GitRevisionPlugin = require('git-revision-webpack-plugin');

const gen = (browser) => {

    const manifestGit = new GitRevisionPlugin({
        versionCommand: "describe --abbrev=0"
    });

    let versionName = manifestGit.version();
    let version = versionName.replace(/v/g, "");

    {
        const rcIndex = version.indexOf("-rc");
        if (rcIndex !== -1) {
            version = version.substring(0, rcIndex);
        }
    }


    let manifest = {
        manifest_version: 2,
        name: 'Roll20 Enhancement Suite',
        version,
        description: 'Provides quality-of-life and workflow speed improvements to Roll20.',

        permissions: [
            '*://app.roll20.net/editor/',
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
                matches: [
                    '*://app.roll20.net/editor/'
                ],
                js: [
                    'ContentScript.js'
                ]
            }
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
        manfiest.version_name = versionName;
    }

    return Object.assign(manifest, browser.manifest);
}

module.exports = gen;
