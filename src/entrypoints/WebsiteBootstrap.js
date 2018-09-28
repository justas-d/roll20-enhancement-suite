import hooks from "../Configs";
import { Config } from "../tools/Config";
import { safeCall } from "../tools/MiscUtils";
import showProblemPopup from "../tools/ProblemPopup";
import { DOM } from "../tools/DOM";

setTimeout(() => {

    if (typeof (window.d20) !== "undefined" && typeof (window.r20es) !== "undefined") return;

    showProblemPopup(
        <div>
            {`window.d20: ${typeof (window.d20)} ${window.d20}`}<br />
            {`window.r20es: ${typeof (window.r20es)} ${window.r20es}`}<br />
        </div>
    );

}, 15 * 1000);


{ // avoid leaking into window.*
    let ids = [];
    for (const id in hooks) ids.push(id);
    window.postMessage({ r20sAppWantsInitialConfigs: ids }, Config.appUrl);
}

window.r20es = window.r20es || {};
window.r20es.hooks = hooks;

// dispose modules
if ("r20esDisposeTable" in window) {
    for (const key in window.r20esDisposeTable) {
        const fx = window.r20esDisposeTable[key];
        console.log(`Disposing module by key ${key}`);

        try {
            fx();
        } catch (err) {
            console.error(err);
        }
    }

    window.r20esDisposeTable = {};
}

window.r20esInstalledModuleTable = window.r20esInstalledModuleTable || {};
window.r20esDisposeTable = window.r20esDisposeTable || {};

if (!("isLoading" in window.r20es)) {
    window.r20es.isLoading = true;
}

if (window.r20es.recvPluginMsg) {
    window.removeEventListener("message", window.r20es.recvPluginMsg);
}

window.r20es.recvPluginMsg = function (e) {
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
                configs[id] = Object.assign(hook.config, cfg);// overwrite defaults
            } else {
                hook.config = cfg;
            }

            if("enabledByDefault" in hook) {
                hook.config.enabled = hook.enabledByDefault;
            }

            console.log(id);
            console.log(hook.config);
        }

        console.log("WebsiteBootstrap.js applied INITIAL configs.");
        window.postMessage({ r20esLoadModules: true }, Config.appUrl);
        window.postMessage({ r20esAppWantsSync: configs }, Config.appUrl);
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

window.r20es.onAppLoad = window.r20es.onAppLoad || { listeners: [] };

window.r20es.onAppLoad.fire = function () {
    if (window.r20es.isWindowLoaded) return;
    window.r20es.isWindowLoaded = true;

    for (let listener of window.r20es.onAppLoad.listeners) {
        safeCall(listener);
    }
};

window.r20es.onAppLoad.addEventListener = function (fx) {
    window.r20es.onAppLoad.listeners.push(fx);
};

window.r20es.onAppLoad.removeEventListener = function (fx) {
    let idx = window.r20es.onAppLoad.listeners.length;

    while (idx-- > 0) {
        let cur = window.r20es.onAppLoad.listeners[idx];
        if (cur === fx) {
            window.r20es.onAppLoad.listeners.splice(idx, 1);
        }
    }
};

function setIsLoadingToFalse() {
    window.r20es.isLoading = false;
}

if (window.r20es.isLoading) {
    window.r20es.onAppLoad.removeEventListener(setIsLoadingToFalse);
    window.r20es.onAppLoad.addEventListener(setIsLoadingToFalse);
}

window.r20es.onLoadingOverlayHide = function () {
    if ("r20es" in window) {
        window.r20es.onAppLoad.fire();
    } else {
        alert("R20ES global state is undefined. R20ES will not function properly.");
    }
};


window.r20es.canInstallModules = true;


document.removeEventListener("keyup", window.r20es.onDocumentMouseUp);
document.removeEventListener("keydown", window.r20es.onDocumentMouseUp);

window.r20es.keys = window.r20es.keys || {};
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
