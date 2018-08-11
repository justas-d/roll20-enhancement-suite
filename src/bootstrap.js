import { Config } from "./tools/config";
import { hooks } from "./hooks";
import { safeCall } from "./tools/miscUtil";
import { DialogFormsBootstrapper } from './modules/dialogForms.js';
import { getBrowser } from "./tools/webExtHelpers";
import { SettingsBootstrapper } from "./modules/settings";
import { LocalStorageBootstrapper } from "./modules/localStorageBootstrap";

console.log("=================");
console.log("window.r20es bootstrap");
console.log("=================");

window.bootstrapTable = {};

new DialogFormsBootstrapper().bootstrap();
new SettingsBootstrapper().bootstrap();
new LocalStorageBootstrapper().bootstrap();

function injectScript(name) {
    console.log(`Injecting ${name}`);

    var s = document.createElement("script");
    s.async = false;
    s.src = getBrowser().extension.getURL(`js/${name}`);

    s.onload = () => { s.remove(); };
    document.head.appendChild(s);
}

// inject global environment
injectScript("globals.js");

for (let id in window.bootstrapTable) {
    window.bootstrapTable[id].setup();
}

function recvMsgFromApp(e) {
    if (e.origin !== Config.appUrl) return;
    if (e.data.r20esLoadModules) {
        try {
            console.log("bootstrap.js is injecting modules.");

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

        injectScript("globalsAfter.js");
        window.bootstrapTable = undefined;

        console.log("bootstrap.js is done!");
    }
}

window.addEventListener("message", recvMsgFromApp);

console.log("bootstrap.js is waiting for an OK from globals.js to inject modules.");