const JSZip = require("jszip");
const fs = require("fs");
const manifest = require("./src/static/manifest.json");
const glob = require('glob');

if(!process.env.R20_SESSION) {
    console.error(`environment variable "R20_SESSION" was either not specified or contained an invalid auth token.`);
    process.exit(1);
}

function makeFirefoxProfile() {

    const xpi = new JSZip();

    glob.sync("./src/static/**/*.*").forEach(f => {
        if (fs.lstatSync(f).isDirectory()) return;

        xpi.file(f.replace("./src/static/", ""), fs.readFileSync(f));
    });

    const zip = new JSZip();
    zip.file(`extensions/${manifest.applications.gecko.id}.xpi`, xpi.generate({ type: 'uint8array' }));
    zip.file('prefs.js', 'user_pref("xpinstall.signatures.required", false);');
    return zip.generate({ type: 'base64' });
}

module.exports = {
    src_folders: [
        'nightwatch/tests'
    ],

    globals_path: "nightwatch/globals.js",

    selenium: {
        start_process: true,
        server_path: 'selenium-server-standalone-3.9.1.jar',
    },

    test_settings: {
        default: {
            selenium_port: process.env.SELENIUM_PORT,
            selenium_host: 'localhost',
        },

        firefox: {
			desiredCapabilities: {
                browserName: 'firefox',
                firefox_binary: "/usr/bin/firefox-developer-edition",
                version: 'dev',
                firefox_profile: makeFirefoxProfile()
			},
        },
        chrome: {
            desiredCapabilities: {
                browserName: 'chrome'
            }
        },
    }
}
