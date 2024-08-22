const fs = require('fs');
const shell = require('shelljs');

const assert = (expr, msg) => {
  if(expr) return;
  console.error(msg);
  process.exit(1);
};

let is_prod = true;
if(process.argv[2] === "development") {
  is_prod = false;
}
else if(process.argv[2] === "production") {
  is_prod = true;
}
else {
  assert(false, "Please specify if the userscript is a 'development' or 'production' script");
}

const no_fail = (script) => {
  const result = shell.exec(script);
  if(result.code != 0) {
    process.exit(result.code);
  }
};

const changelogFile = "changelog.json";
if(!fs.existsSync(changelogFile)) {
  console.log(`couldn't find ${changelogFile}`);
  process.exit(1);
}
const changelog_str = fs.readFileSync(changelogFile, "utf8");
const changelog = JSON.parse(changelog_str);
assert(changelog.current != "TODO");

const can_fail = shell.exec;
let path_to_script = "";
let path_to_meta = "";

if(is_prod) {
  no_fail("webpack --mode production --display-error-details --progress --colors --config ./webpack.config.userscript.js");
  path_to_script = "builds/userscript/prod/vttes.user.js";
  path_to_meta = "builds/userscript/prod/vttes.meta.js";
}
else {
  no_fail("webpack --mode development --display-error-details --progress --colors --config ./webpack.config.userscript.js");
  path_to_script = "builds/userscript/dev/vttes.user.js";
  path_to_meta = "builds/userscript/dev/vttes.meta.js";
}

let script = fs.readFileSync(path_to_script, "utf8");

const meta = `// ==UserScript==
// @name         VTT Enhancement Suite
// @namespace    https://justas-d.github.io/
// @version      ${changelog.current}
// @description  aka R20ES. Provides quality-of-life and workflow speed improvements to Roll20.
// @author       @Justas_Dabrila
// @updateURL    https://justas-d.github.io/roll20-enhancement-suite/vttes.meta.js
// @downloadURL  https://justas-d.github.io/roll20-enhancement-suite/vttes.user.js
// @match        https://app.roll20.net/editor
// @match        https://app.roll20.net/editor#*
// @match        https://app.roll20.net/editor?*
// @match        https://app.roll20.net/editor/
// @match        https://app.roll20.net/editor/#*
// @match        https://app.roll20.net/editor/?*
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @connect      cdn.roll20.net
// @webRequest [{"selector":{"include":"*://browser.sentry-cdn.com/*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://www.datadoghq-browser-agent.com/datadog-rum.js"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://cdn.userleap.com/*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://www.google-analytics.com/*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/js/jquery-ui.1.9.0.custom.min.js?*","exclude":"*://app.roll20.net/js/jquery-ui.1.9.0.custom.min.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/v2/js/jquery-1.9.1.js","exclude":"*://app.roll20.net/v2/js/jquery-1.9.1.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/v2/js/jquery.migrate.js","exclude":"*://app.roll20.net/v2/js/jquery.migrate.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/js/featuredetect.js?2","exclude":"*://app.roll20.net/js/featuredetect.js?2n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/v2/js/patience.js","exclude":"*://app.roll20.net/v2/js/patience.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/editor/startjs/?timestamp*","exclude":"*://app.roll20.net/editor/startjs/?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/js/d20/loading.js?v=11","exclude":"*://app.roll20.net/js/d20/loading.js?n=11&v=11"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://cdn.roll20.net/vtt/legacy/production/latest/vtt.bundle.*.js","exclude":"*://cdn.roll20.net/vtt/legacy/production/latest/vtt.bundle.*.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/js/tutorial_tips.js","exclude":"*://app.roll20.net/js/tutorial_tips.js?n*"},"action":"cancel"}]
// ==/UserScript==
`;

script = `

const scripts = unsafeWindow.document.body.querySelectorAll("script");
let bundle_url = null;

for(const el of scripts) {
  if(el.src && el.src.includes("cdn.roll20.net/vtt/legacy/production/latest/vtt.bundle")) {
    bundle_url = el.src;
  }
}
console.log(\`Userscript bundle url: \${bundle_url}\`);

if(bundle_url == null) {
  alert("VTTES Error: Failed to find the bundle URL. VTTES will not function. Please report this on our Discord");
  return;
}

unsafeWindow.enhancementSuiteEnabled = true;

const now = Date.now();

// @UserscriptScriptFetching
GM.xmlHttpRequest({
  method: "GET",
  url: \`\${bundle_url}?n\${now}\`,
  onload: (response) => {
    console.log("Userscript got vtt.bundle.js response:", response);
    unsafeWindow.USERSCRIPT_VTT_BUNDLE_DATA = response.responseText;
  }
});

function boot() {
${script}
};
const str = \`(\${boot.toString()})()\`;
window.eval(str);
`;

if(is_prod) {
  script = `${meta}
${script}
`;
}

fs.writeFileSync(path_to_script, script);
fs.writeFileSync(path_to_meta, meta);

/*
For development, use this loader script:

// ==UserScript==
// @name         Loader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://app.roll20.net/editor/
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @connect      cdn.roll20.net
// @require      file:///work/vttes/builds/userscript/dev/vttes.user.js
// @webRequest [{"selector":{"include":"*://browser.sentry-cdn.com/*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://www.datadoghq-browser-agent.com/datadog-rum.js"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://cdn.userleap.com/*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://www.google-analytics.com/*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/js/jquery-ui.1.9.0.custom.min.js?*","exclude":"*://app.roll20.net/js/jquery-ui.1.9.0.custom.min.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/v2/js/jquery-1.9.1.js","exclude":"*://app.roll20.net/v2/js/jquery-1.9.1.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/v2/js/jquery.migrate.js","exclude":"*://app.roll20.net/v2/js/jquery.migrate.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/js/featuredetect.js?2","exclude":"*://app.roll20.net/js/featuredetect.js?2n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/v2/js/patience.js","exclude":"*://app.roll20.net/v2/js/patience.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/editor/startjs/?timestamp*","exclude":"*://app.roll20.net/editor/startjs/?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/js/d20/loading.js?v=11","exclude":"*://app.roll20.net/js/d20/loading.js?n=11&v=11"},"action":"cancel"}]
//
// @webRequest [{"selector":{"include":"*://cdn.roll20.net/vtt/legacy/production/latest/vtt.bundle.*.js","exclude":"*://cdn.roll20.net/vtt/legacy/production/latest/vtt.bundle.*.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/js/tutorial_tips.js","exclude":"*://app.roll20.net/js/tutorial_tips.js?n*"},"action":"cancel"}]

// ==/UserScript==

change the @require path to the dev vttes.user.js
 */
