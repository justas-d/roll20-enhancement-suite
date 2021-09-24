const shell = require('shelljs');

const noFail = (script) => {
  const result = shell.exec(script);
  if(result.code != 0) {
    console.log(`==> noFail failed on '${script}'`);
    process.exit(result.code);
  }
};

noFail(`cp builds/userscript/prod/vttes.user.js ../r20es-web/`)
noFail(`cp builds/userscript/prod/vttes.meta.js ../r20es-web/`)
noFail(`cd ../r20es-web/ ; git add .`);
noFail(`cd ../r20es-web/ ; git commit -m "script"`);
noFail(`cd ../r20es-web/ ; git push`);

