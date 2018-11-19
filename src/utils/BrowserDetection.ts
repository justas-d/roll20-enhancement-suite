import browser from 'browser-detect';

const isChromium = () => {
    const data = browser();
    return data.name === "chrome" || data.name === "opera";
};

const doesBrowserNotSupportResponseFiltering = () => {
    const browserData = browser();
    console.log(browserData);

    if(isChromium()) return true;

    if (browserData.name === "firefox") {
        if (browserData.versionNumber < 57) return true;
    }

    return false;
};

export {isChromium, doesBrowserNotSupportResponseFiltering}
