import { Config } from "./tools/config";
import { hooks} from "./hooks";
import { safeCall } from "./tools/miscUtil";
import { DialogFormsBootstrapper } from './modules/dialogForms.js';
import { getBrowser } from "./tools/webExtHelpers";

console.log("=================");
console.log("window.r20es bootstrap");
console.log("=================");

window.bootstrapTable = {};

new DialogFormsBootstrapper().bootstrap();

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

// setup comms with the backend
let bgComms = browser.runtime.connect(Config.extentionId);

function bgListener(msg) {
    console.log("Received background message");
    if (msg.hooks) {
        window.postMessage({ r20es_hooks: msg.hooks }, "https://app.roll20.net/editor/");
    }
}

bgComms.onMessage.addListener(bgListener);

console.log("requesting hooks from backend");
bgComms.postMessage({ request: "hooks" });

// inject modules
for(let hookId in hooks) {
    const hook = hooks[hookId];

    if(!("filename" in hook)) continue;
    
    if(hook.filename in window.bootstrapTable) {
        const boot = window.bootstrapTable[hook.filename];

        safeCall(_ => boot.beforeInject());
        injectScript(hook.filename);
        safeCall(_ => boot.afterInject());
        
    } else {
        injectScript(hook.filename);
    }
    
}

window.bootstrapTable = undefined;
console.log("r20es bootstrap done");
