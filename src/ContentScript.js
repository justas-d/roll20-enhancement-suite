import { Config } from "./tools/Config";
import { hooks } from "./Hooks";
import { safeCall, injectScript, isChrome } from "./tools/MiscUtils";
import { SettingsBootstrapper } from "./modules/SettingsModule";
import { DialogFormsBootstrapper } from "./bootstrappers/DialogFormsBootstrapper";
import { LocalStorageBootstrapper } from "./bootstrappers/LocalStorageBootstrapper";

console.log("====================");
console.log("R20ES ContentScript");
console.log("====================");

if (isChrome()) {
    window.postMessage({ r20esHooksForChrome: JSON.parse(JSON.stringify(hooks)) }, Config.appUrl);
}

window.bootstrapTable = {};
window.hasInjectedModules = false;

new DialogFormsBootstrapper().bootstrap();
new SettingsBootstrapper().bootstrap();
new LocalStorageBootstrapper().bootstrap();

injectScript("WebsiteBootstrap.js");

for (let id in window.bootstrapTable) {
    window.bootstrapTable[id].setup();
}

function injectModules() {

    if(window.hasInjectedModules) {
        return;
    }
    window.hasInjectedModules = true;
    
    try {
        console.log("ContentScript.js is injecting modules.");

        // inject modules
        for (let hookId in hooks) {
            const hook = hooks[hookId];

            if (!("filename" in hook)) continue;

            if (hook.filename in window.bootstrapTable) {
                const boot = window.bootstrapTable[hook.filename];

                safeCall(_ => boot.beforeInject());
                injectScript(hook.filename);
                safeCall(_ => boot.afterInject());

            } else {
                injectScript(hook.filename);
            }
        }
    } catch (err) {
        console.error(err);
    }

    injectScript("WebsiteBootstrapAfter.js");
    window.bootstrapTable = undefined;

    console.log("ContentScript.js is done!");
}

function recvMsgFromApp(e) {
    if (e.origin !== Config.appUrl) return;

    if (isChrome()) {

        if (e.data.r20esLoadModules) {
            window.injectWebsiteOK = true;
        }

        if(e.data.r20esChromeInjectionDone) {
            window.injectBackgroundOK = true;
        }

        if(window.injectBackgroundOK && window.injectWebsiteOK) {
            injectModules();
        }
    } else {
        if (e.data.r20esLoadModules) {
            injectModules();
        }
    }
}

window.addEventListener("message", recvMsgFromApp);

console.log("ContentScript.js is waiting for an OK from WebsiteBootstrap.js to inject modules.");
