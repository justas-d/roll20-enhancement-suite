import browser from 'browser-detect';

const isChromium = () => {
    return browser().name === "chrome";
};

const doesBrowserNotSupportResponseFiltering = () => {
    const browserData = browser();
    console.log(browserData);

    if (browserData.name === "chrome") return true;

    if (browserData.name === "firefox") {
        if (browserData.versionNumber < 57) return true;
    }

    return false;
};

export {isChromium, doesBrowserNotSupportResponseFiltering}