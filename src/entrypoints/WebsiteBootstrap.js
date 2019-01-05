import hooks from "../Configs";
import { Config } from "../utils/Config";
import { safeCall } from "../utils/MiscUtils";
import showProblemPopup from "../utils/ProblemPopup";
import { DOM } from "../utils/DOM";
import {EventEmitter} from "../utils/EventEmitter";
import { saveAs } from 'save-as'

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
        window.postMessage({ r20esLoadModules: true }, Config.appUrl);

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
    if ("r20es" in window) {

        if (!window.r20es.isWindowLoaded) {
            window.r20es.isWindowLoaded = true;
            window.r20es.onAppLoad.fire();
        }

        window.r20es.onPageChange.fire();

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

window.r20es.dumpLogs = () => {
    const logSyncBuffer = [];

    window.postMessage({ r20esWantsLogSync: true }, Config.appUrl);

    let didDump = false;
    const doTheDumping = () => {
        if(didDump) return;
        didDump = true;

        let buffer = "";

        const allLogs = [...window.r20es.logging.logs];

        // rebase log time
        for(const context of logSyncBuffer) {
            const tDelta = context.startTime - window.r20es.logging.startTime;
            const modifiedLogs = [...context.logs];

            for(const log of modifiedLogs) {
                log.time -= tDelta;

                allLogs.push(log);
            }
        }

        allLogs.sort((a, b) => {
            if(a.time < b.time) return -1;
            if(a.time > b.time) return 1;
            return 0;
        });

        for(const log of allLogs) {
            buffer += `[${log.time}] [${log.type}] `;
            for(const obj of log.data) {
                buffer += `${JSON.stringify(obj)} `
            }
            buffer += "\n";
        }

        const blob = new Blob([buffer]);
        saveAs(blob, "log.txt");
    };

    doTheDumping();

    /*
    const listener = (e) => {
        if (e.origin !== Config.appUrl) return;
        if(!e.data.r20esGivesLogSync) return;

        logSyncBuffer.push(e.data.r20esGivesLogSync);

        if(logSyncBuffer.length >= 2) {
            window.removeEventListener("message", listener);
            doTheDumping();
        }
    };

    window.addEventListener("message", listener);

    setTimeout(() => {
        if(logSyncBuffer.length < 2) {
            console.error("failed to sync logs, receiver buffers:", logSyncBuffer, "while we needed 2");
            window.removeEventListener("message", listener);
        }
    }, 2000);
    */
};

console.log("WebsiteBootstrap.js done.");
