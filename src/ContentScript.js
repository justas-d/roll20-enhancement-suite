import { Config } from "./tools/Config";
import { hooks } from "./Hooks";
import { getBrowser, safeCall, injectScript } from "./tools/MiscUtils";
import { SettingsBootstrapper } from "./modules/SettingsModule";
import { DialogFormsBootstrapper } from "./bootstrappers/DialogFormsBootstrapper";
import { LocalStorageBootstrapper } from "./bootstrappers/LocalStorageBootstrapper";

console.log("=================");
console.log("window.r20es bootstrap");
console.log("=================");

window.bootstrapTable = {};

new DialogFormsBootstrapper().bootstrap();
new SettingsBootstrapper().bootstrap();
new LocalStorageBootstrapper().bootstrap();

injectScript("WebsiteBootstrap.js");

for (let id in window.bootstrapTable) {
    window.bootstrapTable[id].setup();
}

function recvMsgFromApp(e) {
    if (e.origin !== Config.appUrl) return;
    if (e.data.r20esLoadModules) {
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
}

window.addEventListener("message", recvMsgFromApp);

console.log("ContentScript.js is waiting for an OK from globals.js to inject modules.");
