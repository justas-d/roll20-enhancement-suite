function injectScript(name) {
    console.log(`Injecting ${name}`);

    var s = document.createElement("script");
    s.async = false;
    s.src = (chrome || browser).extension.getURL(`js/${name}.js`);

    s.onload = () => { s.remove(); };
    document.head.appendChild(s);
}


console.log("=================");
console.log("window.r20es bootstrap");
console.log("=================");

// inject global environment
injectScript("globals");

// modules
injectScript("add-duplicate-to-journal-menu");
injectScript("auto-select-next-token");
injectScript("bulk-macros");
injectScript("character-io");
injectScript("draw-current-layer");
injectScript("initiative-shortcuts");
injectScript("middle-click-select");
injectScript("move-camera-to-token-on-turn");
injectScript("table-io");
injectScript("token-layer-drawing");

// setup comms with the backend
let bgComms = browser.runtime.connect("{ffed5dfa-f0e1-403d-905d-ac3f698660a7}");

function bgListener(msg) {
    console.log("Received background message");
    if (msg.hooks) {
        window.postMessage({ r20es_hooks: msg.hooks }, "https://app.roll20.net/editor/");
    }
}

bgComms.onMessage.addListener(bgListener);

console.log("requesting hooks from backend");
bgComms.postMessage({ request: "hooks" });

console.log("window.r20es bootstrap done");
