console.log("=================");
console.log("r20es bootstrap");
console.log("=================");

const injectId = "io-scripts";

let existing = document.getElementById(injectId);
if(existing) {
    document.head.removeChild(existing);
}

var root = document.createElement("div");
root.id = injectId;

function createScript(payload, module) {
    var s = document.createElement("script");
	let ctx = chrome || browser;
	
    s.src = ctx.extension.getURL(payload);
    s.onload = () => { s.remove(); };

    root.appendChild(s);
}

createScript("scripts/FileSaver.js");
createScript("scripts/payload.js");
createScript("scripts/character_io.js");

document.head.appendChild(root);

var bg = browser.runtime.connect("{ffed5dfa-f0e1-403d-905d-ac3f698660a7}");

function bgListener(msg) {
    if(msg.hooks) {
        if(msg.hooks.token_layer_drawing.enabled) {
            createScript("scripts/draw_current_layer.js");
        }
    }

    bg.onMessage.removeListener(bgListener);
}

bg.onMessage.addListener(bgListener);

console.log("r20es bootstrap done");
