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

setTimeout(() => {
  noFail(`
curl 'https://github.com/justas-d/roll20-enhancement-suite/blob/gh-pages/vttes.meta.js' \
  -H 'authority: github.com' \
  -H 'cache-control: max-age=0' \
  -H 'sec-ch-ua: " Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'upgrade-insecure-requests: 1' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36' \
  -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' \
  -H 'sec-fetch-site: same-origin' \
  -H 'sec-fetch-mode: navigate' \
  -H 'sec-fetch-user: ?1' \
  -H 'sec-fetch-dest: document' \
  -H 'referer: https://github.com/justas-d/roll20-enhancement-suite/branches' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'cookie: _octo=GH1.1.451227020.1624698254; logged_in=no; _gh_sess=HzWaeUZZNuO9zyaJC3h45A6kVH96hlfpREKJQ3wJhON6VRlGtCny9eotKeoR5bcpkKmNEqhtwd0UDpjjpMcjL%2F%2BtrYcwEo8Xrb8AodhQ6rFkX2yVQ3C19MBsNKpljawlKdqVcEo5MGHunHrU17OmqKnbgLoV%2Bx5nl3hqxKKMQxxjiNPgH83WMzsK5xB7As%2FYcvU6Eanaug4Yux37fBx27uw2RJ2q9kQJLlSewej0t0fzyy9Yi%2F3FJdCRK0lDSoKQuQOTVb7Xhvm9KHeyGioEkw%3D%3D--zGml2sX2HkDEsDFN--u7elrqbhySGVfUDbMODSFQ%3D%3D; tz=Europe%2FVilnius' \
  -H 'if-none-match: W/"233a9b8b6afe7abcd95c994034de807b"' \
  --compressed
  `);
  noFail(`
curl 'https://github.com/justas-d/roll20-enhancement-suite/blob/gh-pages/vttes.meta.js' \
  -H 'authority: github.com' \
  -H 'cache-control: max-age=0' \
  -H 'sec-ch-ua: " Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'upgrade-insecure-requests: 1' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36' \
  -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' \
  -H 'sec-fetch-site: same-origin' \
  -H 'sec-fetch-mode: navigate' \
  -H 'sec-fetch-user: ?1' \
  -H 'sec-fetch-dest: document' \
  -H 'referer: https://github.com/justas-d/roll20-enhancement-suite/branches' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'cookie: _octo=GH1.1.451227020.1624698254; logged_in=no; _gh_sess=HzWaeUZZNuO9zyaJC3h45A6kVH96hlfpREKJQ3wJhON6VRlGtCny9eotKeoR5bcpkKmNEqhtwd0UDpjjpMcjL%2F%2BtrYcwEo8Xrb8AodhQ6rFkX2yVQ3C19MBsNKpljawlKdqVcEo5MGHunHrU17OmqKnbgLoV%2Bx5nl3hqxKKMQxxjiNPgH83WMzsK5xB7As%2FYcvU6Eanaug4Yux37fBx27uw2RJ2q9kQJLlSewej0t0fzyy9Yi%2F3FJdCRK0lDSoKQuQOTVb7Xhvm9KHeyGioEkw%3D%3D--zGml2sX2HkDEsDFN--u7elrqbhySGVfUDbMODSFQ%3D%3D; tz=Europe%2FVilnius' \
  -H 'if-none-match: W/"233a9b8b6afe7abcd95c994034de807b"' \
  --compressed
  `);

}, 5000);
