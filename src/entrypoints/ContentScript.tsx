import {Config} from "../utils/Config";
import {isChromium} from "../utils/BrowserDetection";
import {injectScript, getBrowser} from "../utils/MiscUtils";
import {doesBrowserNotSupportResponseFiltering} from "../utils/BrowserDetection";

const receive_message_from_page = (e) => {
  if(e.origin !== Config.appUrl) {
    return;
  }

  console.log("ContentScript received message:", e);

  if(e.data.r20sAppWantsInitialConfigs) {
    const callback = (p) => {
      let patch = {};

      for(const key of e.data.r20sAppWantsInitialConfigs) {
        patch[key] = key in p ? p[key] : {};
      }

      window.postMessage({r20esInitialConfigs: patch}, Config.appUrl);
    };

    if(isChromium()) {
      chrome.storage.local.get(callback);
    } 
    else {
      browser.storage.local.get().then(callback)
    }
  } 
  else if(e.data.r20esAppWantsSync) {
    const patch = e.data.r20esAppWantsSync;
    console.log("Updating local storage with", patch);
    getBrowser().storage.local.set(patch);
  }
};

window.addEventListener("message", receive_message_from_page);

injectScript("WebsiteBootstrap.js");
