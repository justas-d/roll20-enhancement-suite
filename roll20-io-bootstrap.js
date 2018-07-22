const injectId = "io-scripts";

let existing = document.getElementById(injectId);
if(existing) {
    document.head.removeChild(existing);
}

var root = document.createElement("div");
root.id = injectId;

function createScript(payload, module) {
    var s = document.createElement("script");
    s.src = browser.extension.getURL(payload);
    s.onload = () => { this.remove(); };

    root.appendChild(s);
}

createScript("FileSaver.js");
createScript("roll20-io-payload.js");

document.head.appendChild(root);
