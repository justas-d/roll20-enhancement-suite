const shell = require('shelljs');

const noFail = (script) => {
  const result = shell.exec(script);
  if(result.code != 0) {
    console.log(`==> noFail failed on '${script}'`);
    process.exit(result.code);
  }
};

noFail(`npm run build-userscript production`)
noFail(`node utils/userscript_upload.js`)

