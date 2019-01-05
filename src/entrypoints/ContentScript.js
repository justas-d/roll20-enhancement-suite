import {Config} from "../utils/Config";
import hooks from "../Configs";
import {injectScript, getBrowser} from "../utils/MiscUtils";
import SettingsBootstrapper from "../modules/Settings/Bootstrapper"
import {DialogFormsBootstrapper} from "../modules/Dialog/Bootstrapper";
import {LocalStorageBootstrapper} from "../modules/LocalStorage/Bootstrapper";
import {DOM} from "../utils/DOM";
import showProblemPopup from "../utils/ProblemPopup";
import {doesBrowserNotSupportResponseFiltering} from "../utils/BrowserDetection";

console.log("====================");
console.log("R20ES ContentScript");
console.log("====================");

window.bootstrapTable = {};
window.hasInjectedModules = false;

new DialogFormsBootstrapper().bootstrap();
new SettingsBootstrapper().bootstrap();
new LocalStorageBootstrapper().bootstrap();

injectScript("WebsiteBootstrap.js");

console.log("==============================================================");
console.log(window.bootstrapTable);

for (let id in window.bootstrapTable) {
    window.bootstrapTable[id].setup();
}

function injectModules() {

    if (window.hasInjectedModules) {
        return;
    }
    window.hasInjectedModules = true;

    try {
        console.log("ContentScript.js is injecting modules.");

        // inject modules
        for (let hookId in hooks) {
            const hook = hooks[hookId];

            if (!("filename" in hook)) continue;

            injectScript(hook.filename);
        }
    } catch (err) {
        console.error(err);
    }

    injectScript("WebsiteBootstrapAfter.js");
    window.bootstrapTable = undefined;

    console.log("ContentScript.js is done!");
}

const recvMsgFromApp = (e) => {
    if (e.origin !== Config.appUrl) return;

    if (e.data.r20esWantsResourceUrl) {

        const url = getBrowser().extension.getURL(e.data.r20esWantsResourceUrl.resource);
        const payload = {
            url,
            id: e.data.r20esWantsResourceUrl.id
        };

        window.postMessage({r20esGivesResourceUrl: payload}, Config.appUrl);
    } else {
        console.log(e.data);

        if (doesBrowserNotSupportResponseFiltering()) {

            if (e.data.r20esLoadModules) {
                window.injectWebsiteOK = true;
            }

            if (e.data.r20esChromeInjectionDone) {
                window.injectBackgroundOK = true;
            }

            if (window.injectBackgroundOK && window.injectWebsiteOK) {
                injectModules();
            }

        } else {
            if (e.data.r20esLoadModules) {
                injectModules();
            }
        }
    }
};

window.addEventListener("message", recvMsgFromApp);

console.log("ContentScript.js is waiting for an OK from WebsiteBootstrap.js to inject modules.");

setTimeout(() => {

    if (window.hasInjectedModules) return;

    showProblemPopup(
        <div>
            {`window.hasInjectedModules: ${typeof (window.hasInjectedModules)} ${window.hasInjectedModules}`}<br/>
            {`window.injectWebsiteOK: ${typeof (window.injectWebsiteOK)} ${window.injectWebsiteOK}`}<br/>
            {`window.injectBackgroundOK: ${typeof (window.injectBackgroundOK)} ${window.injectBackgroundOK}`}<br/>
            {`window.bootstrapTable: ${typeof (window.bootstrapTable)} ${window.bootstrapTable}`}<br/>
        </div>
    );

}, 20 * 1000);
