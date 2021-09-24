const fs = require('fs');
const shell = require('shelljs');

const noFail = (script) => {
  const result = shell.exec(script);
  if(result.code != 0) {
    console.log(`==> noFail failed on '${script}'`);
    process.exit(result.code);
  }
};

const assert = (expr, msg) => {
  if(expr) {
    return;
  }
  console.error(`==> ASSERTION FAILED: ${msg}`);
  process.exit(1);
};

const canFail = shell.exec;

noFail("npm run changelog");
noFail("gvim changelog.json");

const changelogData = fs.readFileSync("changelog.json", "utf8");
const changelog = JSON.parse(changelogData);

console.log(changelog);

assert(changelog.current !== "TODO", "changelog.current === TODO. Current version in the changelog must be set!");
const currentVersion = changelog.versions[changelog.current];

assert(typeof(currentVersion) === "object", `Could not find current version (${changelog.current}) in the changelog versions table.`);

assert(currentVersion.info.title.length > 0, `Current version (${changelog.current}) doesn't have a title.`);
assert(currentVersion.changes.length > 0, `Current version (${changelog.current}) has no changes.`);

canFail("git add changelog.json");

canFail(`git commit -m "${changelog.current}"`);
noFail(`git tag -a ${changelog.current} -m "${changelog.current}"`);

noFail("npm run package");

fs.writeFileSync('page/latest_chrome_version', changelog.current, 'utf8');

{
  let time = new Date();

  let day = time.getDate();
  let month = `${time.getMonth() + 1}`;
  if(month.length == 1) {
    month = `0${month}`;
  }

  let year = time.getFullYear();
  let time_str = `${year}-${month}-${day}`
  fs.writeFileSync('page/chrome_last_update_time', time_str, 'utf8');
}

noFail(`cp dist/chrome/prod/r20es_${changelog.current}_chrome.zip page/`);

noFail("node utils/deploy_userscript.js");

noFail("npm run build-page");
noFail("npm run deploy-page");

canFail(`git add page/`);
canFail(`git commit -m "${changelog.current} page"`);

noFail("npm run deploy");

