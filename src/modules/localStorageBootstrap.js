import { R20Bootstrapper } from "../tools/r20bootstrapper";
import { getBrowser } from "../tools/webExtHelpers";
import { Config } from "../tools/config";

class LocalStorageBootstrapper extends R20Bootstrapper.Base {
    constructor() {
        super(__filename);
        this.recvAppMessage = this.recvAppMessage.bind(this);
    }

    generatePatch() {        
        return getBrowser().storage.local.get()
            .then(p => {
                console.log("generating patch, got values:");
                console.log(p);

                for (var key in p) {

                    if(typeof(p[key]) != "object") {
                        p[key] = {};
                    }
                    
                    if(!("enabled" in p[key])) {
                        p[key].enabled = true;
                    }
                }

                console.log("done!");
                return p;
            });
    }

    recvAppMessage(e) {

        if (e.origin !== Config.appUrl) return;

        console.log("Content-script received message from site with proper origin.");
        console.log(e);

        if (e.data.r20sAppWantsInitialConfigs) {
            this.generatePatch().then(p => {
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