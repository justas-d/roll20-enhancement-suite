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

if(is_prod) {
  no_fail("webpack --mode production --display-error-details --progress --colors --config ./webpack.config.userscript.js");
  path_to_script = "builds/userscript/prod/userscript.js";
}
else {
  no_fail("webpack --mode development --display-error-details --progress --colors --config ./webpack.config.userscript.js");
  path_to_script = "builds/userscript/dev/userscript.js";
}

let script = fs.readFileSync(path_to_script, "utf8");

if(is_prod) {
  script = `// ==UserScript==
// @name         VTT Enhancement Suite
// @namespace    https://justas-d.github.io/
// @version      ${changelog.current}
// @description  aka R20ES. Provides quality-of-life and workflow speed improvements to Roll20.
// @author       @Justas_Dabrila
// @match        https://app.roll20.net/editor
// @match        https://app.roll20.net/editor#*
// @match        https://app.roll20.net/editor?*
// @match        https://app.roll20.net/editor/
// @match        https://app.roll20.net/editor/#*
// @match        https://app.roll20.net/editor/?*
// @run-at       document-start
// @webRequest   [{"selector":{"include":"*://app.roll20.net/assets/app.js?*","exclude":"*://app.roll20.net/assets/app.js?n*"},"action":"cancel"}]
// ==/UserScript==

function boot() {
${script}
};
const str = \`(\${boot.toString()})()\`;
window.eval(str);
  `;
}
else {
  script = `
function boot() {
${script}
};
const str = \`(\${boot.toString()})()\`;
window.eval(str);
`;
}

fs.writeFileSync(path_to_script, script);

/*
For development, use this loader script:

// ==UserScript==
// @name         Loader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://app.roll20.net/editor/
// @run-at       document-start
// @require      file:///work/vttes/builds/userscript/dev/userscript.js
// @webRequest   [{"selector":{"include":"*://app.roll20.net/assets/app.js?*","exclude":"*://app.roll20.net/assets/app.js?n*"},"action":"cancel"}]
// ==/UserScript==

change the @require path to the dev userscript.js
 */
