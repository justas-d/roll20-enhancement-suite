<h1 align="center">
    <a href="https://ssstormy.github.io/roll20-enhancement-suite/">Roll20 Enhancement Suite</a>
</h1>

<p align="center">
    <img src="assets/logo/logo.svg">
</p>

<p align="center">
    <b>A quality of life and workflow extension for Roll20</b>
</p>

<p align="center">
    <a href="https://addons.mozilla.org/en-US/firefox/addon/roll20-enhancement-suite/" target="_blank">
    <img src="assets/readme/firefox.png" alt="| for Firefox |"/>
  </a>
  <a href="https://chrome.google.com/webstore/detail/roll20-enhancement-suite/fadcomaehamhdhekodcpiglabcjkepff" target="_blank">
    <img src="assets/readme/chrome.png" alt="| for Chrome |"/>
  </a>
</p>



<hr>

## Discord
We've got a [Discord Server](https://discord.gg/pKxxvuM). Come say hi, discuss new features, report issues etc.

## Contributing
Awesome, contributing is always welcome and appretiatied!

 If you'd like to contribute code please first start a discussion by opening an issue.

If there are any questions regarding the codebase - open an issue.

If you want to suggest a feature or report a bug - open an issue.

Or <link href="https://fonts.googleapis.com/css?family=Cookie" rel="stylesheet"><a class="bmc-button" target="_blank" href="https://www.buymeacoffee.com/stormy"><img src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg" alt="Buy me a coffee"><span style="margin-left:5px">Buy me a coffee</span></a>

## Building

### For Development

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

Or both:
```
npm run build -- --env.browsers=firefox,chrome --mode development
```

The built extension can be found in `builds/(firefox|chome)/(dev|prod)/`.


When devloping with firefox, use web-ext to automatically install and reload the extension:
```
npm run start
```
This will use the `r20esdev` profile.

### Packaging
```
npm run package
```
This will build prod .zip packages and place them in `dist/(firefox|chome)/prod`.

---

## License
The source code is licensed under GPL-3.0.

The logo is licensed under CC BY-NC-SA 4.0.

[dialog-polyfill](https://github.com/GoogleChrome/dialog-polyfill) is copyright The Chromium Authors. See LICENSE.
