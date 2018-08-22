<h1 align="center">
    <a href="https://github.com/SSStormy/roll20-enhancement-suite">Roll20 Enhancement Suite</a>
</h1>

<p align="center">
    <img src="assets/logo.svg">
</p>

<p align="center">
    <b>A browser plugin that provides quality-of-life and workflow speed improvements to Roll20.</b>
</p>


<p align="center">
  Currently under construction.
</p>

<hr>


## Building

Pull dependencies:
```
npm install
```

Start the webpack build process for Firefox:
```
npm run build -- --env.browsers=firefox --mode development
```

Or for Chrome:
```
npm run build -- --env.browsers=chrome --mode development
```
The built extention can be found in `builds/(firefox|chome)/(dev|prod)/`.


When devloping with firefox, use web-ext to automatically install and reload the extention:
```
npm run start
```
This will use the `r20esdev` profile.

Packaging:
```
npm run build -- --env.browsers=chrome,firefox --mode production --env.zip
```
Extention packages can be found in `dist/(firefox|chome)/(dev|prod)/`.

