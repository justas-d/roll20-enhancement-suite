import About from "../page/about";
import Features from "../page/features";
import Index from "../page/index";
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import Chrome from "../page/chrome";

const fs = require("fs");
const path = require("path");

const buildDir = "../r20es-web/";

const addStaticFile = (mappedName, sourcePath) => fs.copyFile(sourcePath, path.join(buildDir, mappedName), () => {});

const buildPage = (fx, resource) => {
  addStaticFile(`${resource}.css`, `./page/${resource}.css`);
  const data = ReactDOMServer.renderToStaticMarkup(fx);

  const page = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>VTT Enhancement Suite</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css" integrity="sha384-Smlep5jCw/wG7hdkwQ/Z5nLIefveQRIY9nfy6xoR1uRYBtpZgI6339F5dgvm/e9B" crossorigin="anonymous">

    <link rel="stylesheet" href="main.css">
    <link rel="stylesheet" href="${resource}.css">
  </head>
  <body>
    ${data}    
  </body>
</html>
`;

  fs.writeFile(path.join(buildDir, resource +".html"), page, () => {});
}

buildPage(<About/>, "about");
buildPage(<Features/>, "features");
buildPage(<Index/>, "index");
buildPage(<Chrome/>, "chrome");

const addStaticFolder = (folder) => {
  fs.readdirSync(folder).forEach(f => {
    addStaticFile(f, folder + f);
  });
}

addStaticFolder("./assets/settings/");
addStaticFolder("./assets/site/");
addStaticFile("latest_chrome_version", "./page/latest_chrome_version");
addStaticFile("tags.js", "./page/tags.js");
addStaticFile("contribute.html", "./page/contribute.html");
addStaticFile("logo.svg", "./assets/logo/logo.svg");
addStaticFile("main.css", "./page/main.css");
addStaticFile("more.css", "./page/more.css");
addStaticFile("takedown.png", "./page/takedown.png");
addStaticFile("patreon.webp", "./page/patreon.webp");

