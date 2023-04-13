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

2.1. Possible error:

If you run into the following error:
```
Error in bail mode: Error: callback(): The callback was already called.
    at context.callback (/work/vttes/node_modules/loader-runner/lib/LoaderRunner.js:106:10)
    at processTicksAndRejections (node:internal/process/task_queues:95:5) Error: callback(): The callback was already called.
    at context.callback (/work/vttes/node_modules/loader-runner/lib/LoaderRunner.js:106:10)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
```

Then you'll want to run the following line in your command line:

```
export NODE_OPTIONS=--openssl-legacy-provider
```

Afterwards, run `npm run package` again.

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

If you run into the following error:
```
Error in bail mode: Error: callback(): The callback was already called.
    at context.callback (/work/vttes/node_modules/loader-runner/lib/LoaderRunner.js:106:10)
    at processTicksAndRejections (node:internal/process/task_queues:95:5) Error: callback(): The callback was already called.
    at context.callback (/work/vttes/node_modules/loader-runner/lib/LoaderRunner.js:106:10)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
```

Then you'll want to run the following line in your command line:

```
export NODE_OPTIONS=--openssl-legacy-provider
```


The built extension can be found in `builds/(firefox|chome)/(dev|prod)/`.


When devloping with firefox, use web-ext to automatically install and reload the extension:
```
npm run start
```
This will use the `r20esdev` profile.

