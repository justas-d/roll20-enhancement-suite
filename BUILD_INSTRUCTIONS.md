# Quick production build

0. You either have to clone the repository or have a `git_data.json` file in the root folder of the project.

1. Install dependencies:

```
npm install
```

2. Build the Chrome & FF packages.

```
npm run package
```

The final .zip files can be found in `dist/(firefox|chrome)/prod`

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

