import { R20Bootstrapper } from "../tools/R20Bootstrapper";
import { Config } from "../tools/Config";
import { getBrowser } from "../tools/MiscUtils";


class LocalStorageBootstrapper extends R20Bootstrapper.Base {
    constructor() {
        super(__filename);
        this.recvAppMessage = this.recvAppMessage.bind(this);
    }

    generatePatch(ids, externalCallback) {

        function callback(p) {
            let patch = {};
            console.log("generating patch, got values:");
            console.log(p);

            for (const key of ids) {

                patch[key] = key in p ? p[key] : {};

                if (!("enabled" in patch[key])) {
                    patch[key].enabled = true;
                }
            }

            console.log("done!");
            console.log(patch);

            externalCallback(patch);
        }

        if(chrome) {
            chrome.storage.local.get({}, callback);
        } else {
            browser.storage.local.get().then(callback)
        }
    }

    recvAppMessage(e) {

        if (e.origin !== Config.appUrl) return;

        console.log("Content-script received message from site with proper origin.");
        console.log(e);

        if (e.data.r20sAppWantsInitialConfigs) {
            this.generatePatch(e.data.r20sAppWantsInitialConfigs, p => {
                console.log("Content-script is dispatching a config patch:");
                console.log(p);
                window.postMessage({ r20esInitialConfigs: p }, Config.appUrl);
            });
        } else if (e.data.r20esAppWantsSync) {
            const patch = e.data.r20esAppWantsSync;
            getBrowser().storage.local.set(patch);
        }
    }

    setup() {
        window.addEventListener("message", this.recvAppMessage);
    }

    disposePrevious() {
        window.removeEventListener("message", this.recvAppMessage);
    }
}

export { LocalStorageBootstrapper };
