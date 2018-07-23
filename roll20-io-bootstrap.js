setTimeout(() => {
	console.log("=======================================================");
console.log("=======================================================");
console.log("=======================================================");
console.log("=======================================================");
console.log("=======================================================");
console.log("=======================================================");
console.log("=======================================================");
console.log("=======================================================");
console.log("=======================================================");
console.log("=======================================================");

console.log("roll20 bootstrap");


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

createScript("FileSaver.js");
createScript("roll20-io-payload.js");

document.head.appendChild(root);
}, 1000);
