const GitRevisionPlugin = require('git-revision-webpack-plugin');

const gen = (extra) => {

    const manifestGit = new GitRevisionPlugin({
        versionCommand: "describe --abbrev=0"
    });

    const version = manifestGit.version().replace(/v/g, "");

    let manifest ={
        manifest_version: 2,
        name: 'Roll20 Enhancement Suite',
        version: version,
        description: 'Bunch of improvements to roll20.',

        permissions: [
            '*://app.roll20.net/editor/',
            'webRequest',
            'webRequestBlocking',
            'storage'
        ],
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

    return Object.assign(manifest, extra);
}

module.exports = gen;
