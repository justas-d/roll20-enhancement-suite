const firefox = {
    id: "firefox",
    target: "firefox",

    extraFiles: [
        "./thirdparty/dialog-polyfill/dialog-polyfill.css",
        "./thirdparty/dialog-polyfill/dialog-polyfill.js"
    ],

    manifest: {

        icons: {
            '16': 'logo.svg',
            '48': 'logo.svg',
            '96': 'logo.svg',
            '128': 'logo.svg',
            '256': 'logo.svg',
            '512': 'logo.svg',
            '1024': 'logo.svg',
            '2048': 'logo.svg'
        },
        applications: {
            gecko: {
                id: '{ffed5dfa-f0e1-403d-905d-ac3f698660a7}'
            }
        },
    }
}

module.exports = firefox;
