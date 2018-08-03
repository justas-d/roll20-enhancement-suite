/*
 * Responsible for 
 *   injecting the r20es global environment and modules, 
 *   communicating with the backend on behalf of the injected scripts.
 */

console.log("=================");
console.log("r20es bootstrap");
console.log("=================");

// inject scripts
const injectId = "io-scripts";

let existing = document.getElementById(injectId);

if(existing) {
    existing.remove();
}

var root = document.createElement("div");
root.id = injectId;

function createScript(payload) {
    if(!payload) return;

    var s = document.createElement("script");
    
    s.src = (chrome || browser).extension.getURL(payload);
    
    s.onload = () => { s.remove(); };

    root.appendChild(s);
}

document.head.appendChild(root);


// setup comms with the backend
let bgComms = browser.runtime.connect("{ffed5dfa-f0e1-403d-905d-ac3f698660a7}");

function requestHooksFromBackend() {
    console.log("requesting hooks from backend");
    bgComms.postMessage({request: "hooks"});
}

let hasInjectedHooks = false;

function bgListener(msg) {
    console.log("Received background message");
    if(msg.hooks) {

        window.postMessage({r20es_hooks: msg.hooks}, "https://app.roll20.net/editor/");

        if(!hasInjectedHooks) {
            hasInjectedHooks = true;

            for(let id in msg.hooks) {
                let hook = msg.hooks[id];

                if(!hook.config.enabled) continue;
                if(!hook.inject) continue;

                for(let payload of hook.inject) {
                    createScript("scripts/modules/" + payload);
                }
            }
        }
    }
}

bgComms.onMessage.addListener(bgListener);

requestHooksFromBackend();

// inject global environment
createScript("scripts/FileSaver.js");
createScript("scripts/globals.js");

console.log("r20es bootstrap done");
