const fs = require('fs');
const shell = require('shelljs');

const no_fail = (script) => {
  const result = shell.exec(script);
  if(result.code != 0) {
    process.exit(result.code);
  }
};

const assert = (expr, msg) => {
  if(expr) return;
  console.error(msg);
  process.exit(1);
};

const can_fail = shell.exec;

no_fail("webpack --display-error-details --progress --colors --config ./webpack.config.userscript.js");

const userscript_path = "builds/userscript/dev/userscript.js";
let script = fs.readFileSync(userscript_path, "utf8");

script = `
function boot() {
${script}
};

const str = \`(\${boot.toString()})()\`;
console.log(str);
window.eval(str);

`;

fs.writeFileSync(userscript_path, script);
