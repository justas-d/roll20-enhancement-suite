const R20WaitForAppLoad = browser => {
    return browser.waitForElementNotVisible("#loading-overlay", 4000);
}

const R20Init = browser => {
    browser.url('https://app.roll20.net/editor/')
        .setCookie({
            name: "rack.session",
            value: process.env.R20_SESSION,
            path: "/",
            domain: ".roll20.net",
            secure: true,
            httpOnly: true,
        })
        .url('https://app.roll20.net/editor/');

    return R20WaitForAppLoad(browser);
}


const getElementId = el => {
    return Object.values(el)[0];
}

module.exports = {
    R20WaitForAppLoad,
    R20Init,
    getElementId,
}

