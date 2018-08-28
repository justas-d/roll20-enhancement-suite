const firefox = {
    id: "firefox",
    target: "firefox",

    extraFiles: [
        "./thirdparty/dialog-polyfill/dialog-polyfill.css",
        "./thirdparty/dialog-polyfill/dialog-polyfill.js"
    ],

    manifest: {
        applications: {
            gecko: {
                id: '{ffed5dfa-f0e1-403d-905d-ac3f698660a7}'
            }
        },
    }
}

module.exports = firefox;
