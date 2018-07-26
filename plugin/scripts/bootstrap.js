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

document.head.appendChild(root);

console.log("r20es bootstrap done");
