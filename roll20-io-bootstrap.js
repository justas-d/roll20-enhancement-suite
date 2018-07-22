const injectId = "io-script";

let existing = document.getElementById(injectId);

if(existing) {
    document.head.removeChild(existing);
}

var s = document.createElement("script");
s.src = browser.extension.getURL("roll20-io-payload.js");
s.id = "io-script";
s.onload = function() { this.remove(); };
document.head.appendChild(s);
//(document.head || document.documentElement).appendChild(s);
