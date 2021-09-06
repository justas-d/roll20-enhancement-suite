import browser from 'browser-detect';

export const isChromium = () => {
  const data = browser();
  return data.name === "chrome" || data.name === "opera";
};

export const doesBrowserNotSupportResponseFiltering = () => {
  const browserData = browser();
  console.log(browserData);

  if(isChromium()) return true;

  if (browserData.name === "firefox") {
    if (browserData.versionNumber < 57) return true;
  }

  return false;
};
