const fs = require('fs');
const firefoxDeploy = require('firefox-extension-deploy');
var request = require('request');
require('dotenv').load();

const deployData = JSON.parse(fs.readFileSync("deploy_data.json", "utf8"));

console.log(`Deploying version ${deployData.version} for:`);

if (typeof (deployData.chrome) !== "undefined") {
    console.log(`  Chrome: ${deployData.chrome}`);
    const chromeWebStore = require('chrome-webstore-upload')({
        extensionId: 'fadcomaehamhdhekodcpiglabcjkepff',
        clientId: process.env.CHROME_CLIENT_ID,
        clientSecret: process.env.CHROME_SECRET,
        refreshToken: process.env.CHROME_REFRESH_TOKEN,
    });

    chromeWebStore.fetchToken()
        .then(token => {
            chromeWebStore.uploadExisting(fs.createReadStream(`./dist/chrome/prod/${deployData.chrome}`), token)

                .then(res1 => {

                    console.log(res1);
                    chromeWebStore.publish("trustedTesters", token).then(res2 => {

                        console.log(res2);
                    });
                })
        });
}

if (typeof (deployData.firefox) !== "undefined") {
    console.log(`  Firefox: ${deployData.firefox}`);
    
    firefoxDeploy({
        issuer: process.env.FIREFOX_ISSUER,
        secret: process.env.FIREFOX_SECRET,

        id: "{ffed5dfa-f0e1-403d-905d-ac3f698660a7}",
        version: deployData.version,
        src: fs.createReadStream(`./dist/firefox/prod/${deployData.firefox}`),
    }).then(function () {
        console.log("Firefox: success!");
    }, function (err) {
        console.log("Firefox error");
        console.log(err);
    });
}

