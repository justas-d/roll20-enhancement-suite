import { Config } from "./tools/config";
import { hooks } from "./hooks";

function injectScript(name) {
    console.log(`Injecting ${name}`);

    var s = document.createElement("script");
    s.async = false;
    s.src = (chrome || browser).extension.getURL(`js/${name}`);

    s.onload = () => { s.remove(); };
    document.head.appendChild(s);
}


console.log("=================");
console.log("window.r20es bootstrap");
console.log("=================");

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
    
    injectScript(hook.filename);
}

console.log("r20es bootstrap done");
