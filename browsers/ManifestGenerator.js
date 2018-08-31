const GitRevisionPlugin = require('git-revision-webpack-plugin');

const gen = (browser, origVersionName) => {

    const versionName = origVersionName.replace(/v/g, "");
    let finalVersion = null;

    const dashIndex = versionName.indexOf("-");
    if (dashIndex !== -1) {
        finalVersion = versionName.substring(0, dashIndex);
    } else {
        finalVersion = versionName;
    }

    const rcString = "-rc."
    const rcIndex = versionName.indexOf(rcString);
    if (rcIndex !== -1) {
        let idx = rcIndex + rcString.length;
        let numBuf = "";
        const isdigit = c => ((c >= '0') && (c <= '9'));

        do {
            const char = versionName.charAt(idx);
            console.log(char);
            if (versionName.length > idx && isdigit(char)) {
                idx++;
                numBuf += char;
            } else { break; }

        } while (true);

        //console.log(numBuf);
        //console.log(`${rcIndex}-${idx}/${versionName.length}`);

        if (numBuf.length > 0) {
            finalVersion += `.${numBuf}`
        }
    }

    //console.log(finalVersion);

    let manifest = {
        manifest_version: 2,
        name: 'Roll20 Enhancement Suite',
        version: finalVersion,
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
        manifest.version_name = versionName;
    }

    return Object.assign(manifest, browser.manifest);
}

module.exports = gen;
