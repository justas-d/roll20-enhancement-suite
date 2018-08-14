const assert = require("assert");

function R20Init(browser) {
    return browser
        
        .url('https://app.roll20.net/editor/')
        .setCookie({
            name: "rack.session",
            value: process.env.R20_SESSION,
            path: "/",
            domain: ".roll20.net",
            secure: true,
            httpOnly: true,
        })
        .url('https://app.roll20.net/editor/')
        .waitForElementNotVisible("#loading-overlay", 3000)
}


module.exports = {
    'R20ES Settings button': function (b) {
        R20Init(b);
        b.click("[title='My Settings']")
        b.click("#r20es-settings-button")
        b.waitForElementVisible(".r20es-settings-dialog", 1000)
        b.assert.containsText(".r20es-settings-dialog .dialog-header h2", "Roll20 Enhancement Suite Settings");


        b.expect.element(".r20es-settings-dialog .r20es-clickable-text input[type='checkbox']").to.be.selected

        b.click(".r20es-settings-dialog .r20es-clickable-text")
        b.click(".r20es-settings-dialog .r20es-clickable-text input[type='checkbox']");
        b.expect.element(".r20es-settings-dialog .r20es-clickable-text input[type='checkbox']").to.not.be.selected

        b.keys([b.Keys.ESCAPE])
        b.click("#r20es-settings-button")
        b.waitForElementVisible(".r20es-settings-dialog", 1000)

        b.expect.element(".r20es-settings-dialog .r20es-clickable-text input[type='checkbox']").to.not.selected
        b.click(".r20es-settings-dialog .r20es-clickable-text input[type='checkbox']")

        b.end();
    }
};
