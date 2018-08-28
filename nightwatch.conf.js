const fs = require("fs");
const JSZip = require("jszip");
import { Firefox} from "./manifests/firefox";

if(!process.env.R20_SESSION) {
    console.error(`environment variable "R20_SESSION" was either not specified or contained an invalid auth token.`);
    process.exit(1);
}

function makeFirefoxProfile() {

    let zip = new JSZip();
    zip.file(`extensions/${Firefox.manifest.applications.gecko.id}.xpi`, fs.readFileSync("dist/firefox/prod/r20es.zip"));
    zip.file('prefs.js', 'user_pref("xpinstall.signatures.required", false);');
    return zip.generate({ type: 'base64' });
}

module.exports = {
    src_folders: [
        'tests/nightwatch/tests'
    ],

    globals_path: "tests/nightwatch/globals.js",

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
