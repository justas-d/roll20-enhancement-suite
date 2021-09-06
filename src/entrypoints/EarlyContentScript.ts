import { getBrowser } from "../utils/MiscUtils";

console.log("EARLY CONTENT SCRIPT");

const url = getBrowser().extension.getURL("WebsiteBootstrapBefore.js");
console.log(url);

let waitedFor = 0;

(function waitForDepts() {
  if (document.head) {
    console.log(`ECS is ready after ${waitedFor}ms`);
    let script = document.createElement("script");
    script.src = url;
    script.async = false;
    document.head.appendChild(script);
    console.log("Early content script is done");
    return;
  }

  waitedFor += 10;
  setTimeout(waitForDepts, 10);
})();

