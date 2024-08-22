import { getBrowser } from "../utils/MiscUtils";
import { Config } from "../utils/Config";

console.log("EARLY CONTENT SCRIPT");

const url = getBrowser().extension.getURL("WebsiteBootstrapBefore.js");
console.log(url);

let waitedFor = 0;

(function wait_for_depts() {
  if(!document.head) {
    waitedFor += 10;
    setTimeout(wait_for_depts, 10);
    return;
  }

  console.log(`ECS is ready after ${waitedFor}ms`);

  const script = document.createElement("script");
  script.src = url;
  script.async = false;
  document.head.appendChild(script);

  if(BUILD_CONSTANT_TARGET_PLATFORM === "chrome") {
    // @ChromeScriptFetching
    const listener = (msg) => {
      if(msg.origin !== Config.appUrl) {
        return;
      }

      if(msg.data.VTTES_BOOTSTRAP_WANTS_CDN_SCRIPTS) {
        console.log("EarlyContentScript got VTTES_BOOTSTRAP_WANTS_CDN_SCRIPTS. Sending VTTES_WANTS_CDN_SCRIPTS_FROM_BACKGROUND");

        chrome.runtime.sendMessage(
          {VTTES_WANTS_CDN_SCRIPTS_FROM_BACKGROUND: msg.data.VTTES_BOOTSTRAP_WANTS_CDN_SCRIPTS},
          (response) => {
            console.log("EarlyContentScript got VTTES_WANTS_CDN_SCRIPTS_FROM_BACKGROUND:", response);
            console.log("EarlyContentScript sending VTTES_CDN_SCRIPTS");

            window.postMessage({VTTES_CDN_SCRIPTS: response}, Config.appUrl);
          }
        );

        window.removeEventListener("message", listener);
      }
    };

    window.addEventListener("message", listener);
  }

  console.log("Early content script is done");

})();

