import {Config} from "../utils/Config";
import {isChromium} from "../utils/BrowserDetection";
import { VTTES_MODULE_CONFIGS } from "../Configs";
import {injectScript, getBrowser, findByIdAndRemove} from "../utils/MiscUtils";
import {DOM} from "../utils/DOM";
import showProblemPopup from "../utils/ProblemPopup";
import {doesBrowserNotSupportResponseFiltering} from "../utils/BrowserDetection";
import {
  ELEMENT_ID_BOOTSTRAP_FLASH_WORKAROUND_STYLE,
  MESSAGE_KEY_CHROME_INJECTION_DONE,
  MESSAGE_KEY_DOM_LOADED,
  MESSAGE_KEY_LOAD_MODULES,
  MESSAGE_KEY_INJECT_MODULES
} from "../MiscConstants";
import {getHooks, injectHooks} from "../HookUtils";

console.log("====================");
console.log("VTTES ContentScript");
console.log("====================");

const recvMsgFromApp = (e) => {
  if(e.origin !== Config.appUrl) return;

  console.log("ContenScript msg:", e);

  if(e.data.r20sAppWantsInitialConfigs) {
    const generatePatch = (ids, externalCallback) => {
      function callback(p) {
        let patch = {};
        //console.log("generating patch, got values:");
        //console.log(p);

        for (const key of ids) {
          patch[key] = key in p ? p[key] : {};
        }

        //console.log("done!");
        //console.log(patch);

        externalCallback(patch);
      }

      if (isChromium()) {
        chrome.storage.local.get(callback);
      } 
      else {
        browser.storage.local.get().then(callback)
      }
    };

    generatePatch(e.data.r20sAppWantsInitialConfigs, p => {
      //console.log("Content-script is dispatching a config patch:");
      //console.log(p);
      window.postMessage({ r20esInitialConfigs: p }, Config.appUrl);
    });
  } 
  else if(e.data.r20esAppWantsSync) {
    const patch = e.data.r20esAppWantsSync;
    console.log("Updating local storage with", patch);
    getBrowser().storage.local.set(patch);
  }
  else if(e.data.r20esWantsResourceUrl) {

    const url = getBrowser().extension.getURL(e.data.r20esWantsResourceUrl.resource);
    const payload = {
      url,
      id: e.data.r20esWantsResourceUrl.id
    };

    window.postMessage({r20esGivesResourceUrl: payload}, Config.appUrl);
  } 
  else {
    if(doesBrowserNotSupportResponseFiltering()) {

      const try_inject_modules = () => {
        if(window.injectBackgroundOK && window.injectWebsiteOK) {
          window.postMessage({[MESSAGE_KEY_INJECT_MODULES]: true}, Config.appUrl);
        }
      };

      if(e.data[MESSAGE_KEY_LOAD_MODULES]) {
        window.injectWebsiteOK = true;
        try_inject_modules();
      }

      if(e.data[MESSAGE_KEY_CHROME_INJECTION_DONE]) {
        window.injectBackgroundOK = true;
        try_inject_modules();
      }
    } 
    else {
      if(e.data[MESSAGE_KEY_LOAD_MODULES]) {
        window.postMessage({[MESSAGE_KEY_INJECT_MODULES]: true}, Config.appUrl);
      }
    }
  }
};

window.addEventListener("message", recvMsgFromApp);

if(doesBrowserNotSupportResponseFiltering()) {

  const hookedScriptQueue = {};
  let numScriptsDone = 0;

  const waitForDepts = () => {
    if(document.readyState !== "complete") {
      setTimeout(waitForDepts, 10);
      return;
    }

    console.log("DOM LOADED, requesting redirectQueue.");

    const response_callback = async (redirectQueue: any) => {
      console.log("Received redirectQueue from background:", redirectQueue);

      for(let urlIndex = 0;
          urlIndex < redirectQueue.length;
          urlIndex++
      ) {
        const url = redirectQueue[urlIndex];

        try {
          const response = await fetch(url);
          const originalScriptSource = await response.text();

          {
            let hookedData = originalScriptSource;
            // take over jquery .ready
            hookedData = hookedData.replace(
              "jQuery.ready.promise().done( fn );",
              `if(!window.r20esChrome) window.r20esChrome = {};
               if(!window.r20esChrome.readyCallbacks) window.r20esChrome.readyCallbacks = [];
              window.r20esChrome.readyCallbacks.push(fn);`
            );

            // incredibly long loading screens fix
            hookedData = hookedData.replace(
              "},6e4))",
              "},250))"
            );

            const hookQueue = getHooks(VTTES_MODULE_CONFIGS, url);
            hookedData = injectHooks(hookedData, hookQueue);

            const blob = new Blob([hookedData]);
            const hookedScriptUrl = URL.createObjectURL(blob);
            const scriptElement = document.createElement("script");

            scriptElement.async = false;
            scriptElement.src = hookedScriptUrl;
            scriptElement.id = url;

            hookedScriptQueue[urlIndex] = scriptElement;
          }

          numScriptsDone++;

          if(numScriptsDone === redirectQueue.length) {
            /*
              NOTE(justas);
              for some reason, when we call document.body.appendChild(scriptElement);
              the screen flashes white because the styles get all messed up.
              This style change bodges a workaround by making the background black,
              thus the flash becomes subtle.
              @BootstrapFlashWorkaroundStyle
             */
            {
              const style = document.createElement("style");
              style.innerHTML = "body { background: black !important; }";
              style.id = ELEMENT_ID_BOOTSTRAP_FLASH_WORKAROUND_STYLE;
              document.head.appendChild(style);
            }

            console.log("Scripts are done, dumping", hookedScriptQueue);

            for(const indexKey in hookedScriptQueue) {
              const scriptElement = hookedScriptQueue[indexKey];

              console.log("Injecting ", scriptElement);
              document.body.appendChild(scriptElement);
            }

            injectScript("ChromePostInjectScriptsPayload.js");
          }
        }
        catch(e) {
          console.error("FATAL: redirectQueue promise failed: ", url, e);
        }
      }
    };

    getBrowser().runtime.sendMessage({[MESSAGE_KEY_DOM_LOADED]: true}, response_callback);
  };

  waitForDepts();
}

injectScript("WebsiteBootstrap.js");
