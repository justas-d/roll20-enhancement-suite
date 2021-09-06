import hooks from "../Configs";
import { Config } from "../utils/Config";
import { safeCall } from "../utils/MiscUtils";
import showProblemPopup from "../utils/ProblemPopup";
import { DOM } from "../utils/DOM";
import {EventEmitter} from "../utils/EventEmitter";
import { saveAs } from 'save-as'
import {MESSAGE_KEY_LOAD_MODULES} from "../MiscConstants";

setTimeout(() => {
  if (typeof (window.d20) !== "undefined" && typeof (window.r20es) !== "undefined") return;

  showProblemPopup(
    <div>
      {`window.d20: ${typeof (window.d20)} ${window.d20}`}<br />
      {`window.r20es: ${typeof (window.r20es)} ${window.r20es}`}<br />
    </div>
  );

}, 25 * 1000);

{ // avoid leaking into window.*
  let ids = [];
  for (const id in hooks) ids.push(id);
  window.postMessage({ r20sAppWantsInitialConfigs: ids }, Config.appUrl);
}

// @ts-ignore
window.r20es = window.r20es || {};
window.r20es.hooks = hooks;

// dispose modules
if ("r20esDisposeTable" in window) {
  for (const key in window.r20esDisposeTable) {
    const fx = window.r20esDisposeTable[key];
    console.log(`Disposing module by key ${key}`);

    try {
      fx();
    } 
    catch (err) {
      console.error(err);
    }
  }

  window.r20esDisposeTable = {};
}

window.r20esInstalledModuleTable = window.r20esInstalledModuleTable || {};
window.r20esDisposeTable = window.r20esDisposeTable || {};
window.r20es.isLoading = true;

if (window.r20es.recvPluginMsg) {
  window.removeEventListener("message", window.r20es.recvPluginMsg);
}

window.r20es.recvPluginMsg = (e) => {
  if (e.origin !== Config.appUrl) return;

  console.log("Injected WebsiteBootstrap.js received message from content-script with proper origin.");

  if (e.data.r20esInitialConfigs) {
    const configs = e.data.r20esInitialConfigs;
    const hooks = window.r20es.hooks;

    for (var id in configs) {
      const hook = hooks[id];
      const cfg = configs[id];

      if (!hook) continue;

      if (hook.config) {
        // overwrite defaults
        Object.assign(hook.config, cfg);
      } else {
        hook.config = cfg;
      }

      if(!("enabled" in hook.config)) {
        hook.config.enabled = true;
      }

      console.log(id);
      console.log(hook.config);
    }

    console.log("WebsiteBootstrap.js applied INITIAL configs.");
    window.injectWebsiteOK = true;

    window.postMessage({
      [MESSAGE_KEY_LOAD_MODULES]: true
    }, Config.appUrl);

    window.r20es.syncConfigs();
  }
};

window.addEventListener("message", window.r20es.recvPluginMsg);

window.r20es.syncConfigs = function () {
  let patch = {};
  for (const id in window.r20es.hooks) {
    const hook = window.r20es.hooks[id];

    patch[id] = hook.config;
  }

  window.postMessage({ r20esAppWantsSync: patch }, Config.appUrl);
};

for (const id in window.r20es.hooks) {
  window.r20es.hooks[id].saveConfig = window.r20es.syncConfigs;
}

window.r20es.onAppLoad = EventEmitter.copyExisting(window.r20es.onAppLoad);
window.r20es.onPageChange = EventEmitter.copyExisting(window.r20es.onPageChange);

function setIsLoadingToFalse() {
  window.r20es.isLoading = false;
}

if (window.r20es.isLoading) {
  window.r20es.onAppLoad.removeEventListener(setIsLoadingToFalse);
  window.r20es.onAppLoad.addEventListener(setIsLoadingToFalse);
}

window.r20es.onLoadingOverlayHide = function () {
  if("r20es" in window) {

    let first_load = false;

    if(!window.r20es.isWindowLoaded) {
      window.r20es.isWindowLoaded = true;
      window.r20es.onAppLoad.fire();
      first_load = true;
    }

    window.r20es.onPageChange.fire(first_load);
  } else {
    alert("VTTES global state is undefined. VTTES will not function properly.");
  }
};

window.r20es.canInstallModules = true;

document.removeEventListener("keyup", window.r20es.onDocumentMouseUp);
document.removeEventListener("keydown", window.r20es.onDocumentMouseUp);

window.r20es.keys = window.r20es.keys || {
  altDown: false,
  shiftDown: false,
  ctrlDown: false,
  metaDown: false,
};

window.r20es.onDocumentMouseUp = e => {
  window.r20es.keys.altDown = e.altKey;
  window.r20es.keys.shiftDown = e.shiftKey;
  window.r20es.keys.ctrlDown = e.ctrlKey;

  window.r20es.keys.metaDown = (!e.metaKey && e.key && e.key === "OS")
    ? e.type === "keydown"
    : e.metaKey;
};

document.addEventListener("keyup", window.r20es.onDocumentMouseUp);
document.addEventListener("keydown", window.r20es.onDocumentMouseUp);

console.log("WebsiteBootstrap.js done.");
