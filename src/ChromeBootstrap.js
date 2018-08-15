import { Config } from "./tools/Config";
import { hooks } from "./Hooks";

window.postMessage({ r20esHooksForChrome: JSON.parse(JSON.stringify(hooks)) }, Config.appUrl);

console.log("ChromeBootstrap.js is live");
