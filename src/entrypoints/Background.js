import configs from '../Configs'
import { getBrowser, isChrome, replaceAll } from '../tools/MiscUtils';
import { Config } from '../tools/Config';

const getHooks = (hooks, url) => {

    let hookQueue = [];

    const addModToQueueIfOk = (mod, hook) => {
        if (mod.includes && url.includes(mod.includes) && mod.find && mod.patch) {
            hookQueue.push({ mod, hook });
        }
    }

    for (let id in hooks) {
        let hook = hooks[id];

        if (hook.mods) {
            for (let mod of hook.mods) {
                addModToQueueIfOk(mod, hook);
            }
        } else {
            addModToQueueIfOk(hook, hook);
        }
    }

    return hookQueue;
}

const injectHooks = (intoWhat, hookQueue, replaceFunc) => {
    if (hookQueue.length <= 0) return intoWhat;

    for (let combo of hookQueue) {
        const mod = combo.mod;

        // TODO : move this to Configs.js?
        const patch = replaceFunc(mod.patch, ">>R20ES_MOD_FIND>>", mod.find);

        console.log(`REPLACING: Find: ${mod.find} Patch: ${patch}`);
        intoWhat = replaceFunc(intoWhat, mod.find, patch);
    }

    return intoWhat;
}

window.redirectTargets = [
    "https://app.roll20.net/v2/js/jquery",
    "https://app.roll20.net/js/featuredetect.js",
    "https://app.roll20.net/editor/startjs",
    "https://app.roll20.net/js/jquery",
    "https://app.roll20.net/js/d20/loading.js",
    "https://app.roll20.net/assets/firebase",
    "https://app.roll20.net/assets/base.js",
    "https://app.roll20.net/assets/app.js",
    "https://app.roll20.net/js/tutorial_tips.js",
];

window.editorUrls = [
    "https://app.roll20.net/editor",
    "https://app.roll20.net/editor/",
    "https://app.roll20.net/editor/#*", // handle all fragments
    "https://app.roll20.net/editor#*",
    "https://app.roll20.net/editor/?*", // handle all queries
    "https://app.roll20.net/editor?*"
]

const isEditorUrl = (url) => {
    return typeof(window.editorUrls.find(f => f === url)) !== "undefined" 
            || url.startsWith("https://app.roll20.net/editor/#") 
            || url.startsWith("https://app.roll20.net/editor#")
            || url.startsWith("https://app.roll20.net/editor/?")
            || url.startsWith("https://app.roll20.net/editor?")
}
const isRedirectTarget = (url) => typeof(window.redirectTargets.find(f => url.startsWith(f))) !== "undefined";

if (isChrome()) {

    window.redirectCount = 0;
    window.hasBeenRedirected = {};

    const setupEnvironment = appUrl => {

        window.r20esChrome = {
            scriptQueue: [],
            readyCallbacks: [],
            urlsToFree: [],
        };

        window.r20esChrome.scriptOrder = [
            "https://app.roll20.net/v2/js/jquery-1.9.1.js",
            "https://app.roll20.net/v2/js/jquery.migrate.js",
            "https://app.roll20.net/js/featuredetect.js?2",
            "https://app.roll20.net/editor/startjs",
            "https://app.roll20.net/js/jquery-ui.1.9.0.custom.min.js",
            "https://app.roll20.net/js/d20/loading.js",
            "https://app.roll20.net/assets/firebase.2.4.0.js",
            "https://app.roll20.net/assets/base.js",
            "https://app.roll20.net/assets/app.js",
            "https://app.roll20.net/js/tutorial_tips.js",
        ];

        window.addEventListener("message", e => {
            if (e.origin !== appUrl) return;

            if (e.data.r20esHooksForChrome) {
                console.log("got hooks: ");
                console.log(e.data.r20esHooksForChrome);

                window.r20esChrome.hooks = e.data.r20esHooksForChrome;
            }
        });

        window.r20esChrome.fetchAndInject = function (localUrl) {
            fetch(localUrl, { cache: "no-store", method: "GET", mode: "same-origin", headers: { "Accept": "application/javascript" } })
                .then(response => {

                    console.log(response);

                    response.text().then(text => {

                        // take over jquery .ready
                        text = text.replace(
                            "jQuery.ready.promise().done( fn );",
                            "window.r20esChrome.readyCallbacks.push(fn);");

                        // incredibly long loading screens fix
                        text = text.replace(
                            `"You will join the game shortly..."),i=6e4)`,
                            `"You will join the game shortly..."),i=250)`);

                        const hookQueue = window["getHooks"](window.r20esChrome.hooks, localUrl);
                        text = window["injectHooks"](text, hookQueue, window["replaceAll"]);

                        const blob = new Blob([text], { type: "application/json" });

                        const url = window.URL.createObjectURL(blob);
                        window.r20esChrome.urlsToFree.push(url);
                        console.log(blob);

                        window.r20esChrome.scriptQueue.push({
                            localUrl,
                            blobUrl: url
                        });

                        console.log(`content script done: ${window.r20esChrome.scriptQueue.length}/${window.r20esChrome.scriptOrder.length}`);
                        if (window.r20esChrome.scriptQueue.length >= window.r20esChrome.scriptOrder.length) {
                            console.log("Dumping script queue...");

                            for (const scriptUrl of window.r20esChrome.scriptOrder) {

                                for (const queued of window.r20esChrome.scriptQueue) {

                                    if (queued.localUrl.startsWith(scriptUrl)) {

                                        let s = document.createElement("script");
                                        s.src = queued.blobUrl;
                                        s.async = false;

                                        document.body.appendChild(s);
                                        break;
                                    }
                                }
                            }

                            const cleanupPayload = `
                            window.r20esChrome.urlsToFree.forEach(window.URL.revokeObjectURL); 
                            console.log('freed blob URLs')

                            var DOMContentLoaded_event = document.createEvent("Event");
                            DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
                            window.document.dispatchEvent(DOMContentLoaded_event);

							`;
                            let s = document.createElement("script");
                            s.src = `data:application/javascript;base64,${btoa(cleanupPayload)}`;
                            s.async = false;
                            document.body.appendChild(s);

                            console.log("scripts injected.");


                            setTimeout(() => {
                                for (let i = 0; i < window.r20esChrome.readyCallbacks.length; i++) {
                                    window.r20esChrome.readyCallbacks[i]();
                                }

                                /*
                                    NOTE(Justas):
                                    This notifies ContentScript.js to inject module scripts.
                                    Without this on Chrome, the modules would be injected BEFORE any roll20 scripts are run,
                                    contrary to what happens on Firefox.
                                */
                                window.postMessage({ r20esChromeInjectionDone: true }, appUrl);
                            }, 500);
                        }
                    })
                });
        }

        console.log("init environment");
    }

    window.requestListener = function (dt) {
        if(isEditorUrl(dt.url)) {
            console.log("RESET REDIRECT TABLE");
            window.hasBeenRedirected = {};
            window.redirectCount = 0;
        } else if (isRedirectTarget(dt.url)) {
            if (window.hasBeenRedirected[dt.url]) {
                console.log(`SKIP ${dt.url}`);
                return;
            }

            const scriptString = _ => `window.r20esChrome.fetchAndInject("${dt.url}");`;

            let payload = null;
            if (window.redirectCount <= 0) {

                payload = `
                window.enhancementSuiteEnabled = true;
                var setupEnvironment = ${setupEnvironment.toString()}
                setupEnvironment("${Config.appUrl}");
                var getHooks = ${getHooks.toString()}
                var replaceAll = ${replaceAll.toString()}
                var injectHooks = ${injectHooks.toString()}
                ${scriptString()}
                `
            } else {
                payload = scriptString();
            }

            window.hasBeenRedirected[dt.url] = true;
            ++window.redirectCount;

            console.log(`redirecting ${dt.url}`);

            return { redirectUrl: `data:application/javascript;base64,${btoa(payload)}` };
        }
    }

    function headerCallback(req) {
        if(!isEditorUrl(req.url)) return;

        const headers = JSON.parse(JSON.stringify(req.responseHeaders));

        let idx = headers.length;
        while (idx-- > 0) {
            const header = headers[idx];

            if (header.name !== "content-security-policy") continue;

            header.value += " data: blob:";
            break;
        }

        return { responseHeaders: headers };
    }

    chrome.webRequest.onHeadersReceived.addListener(
        headerCallback,
        { urls: window.editorUrls },
        ["blocking", "responseHeaders"]);

} else {

    // thanks, Firefox.
    window.requestListener = function (dt) {
        
        
        const isRedir = isRedirectTarget(dt.url);
        console.log(`${isRedir}: ${dt.url}`);
        if(!isRedir) return;

        const hookQueue = getHooks(configs, dt.url);
        const filter = getBrowser().webRequest.filterResponseData(dt.requestId);
        const decoder = new TextDecoder("utf-8");

        // Note(Justas): the console.log here forces scripts to run in order
        // and not randomly, avoiding race conditions
        // Along with that, this place is the earliest we can set 
        // window.enhancementSuiteEnabled = true
        let stringBuffer = `console.log("running ${dt.url}");window.enhancementSuiteEnabled = true;`;

        filter.ondata = e => {
            stringBuffer += decoder.decode(e.data, { stream: true });
        };

        filter.onstop = e => {
            
            const hookedData = injectHooks(stringBuffer, hookQueue, replaceAll);

            filter.write(new TextEncoder().encode(hookedData));
            filter.close();
        };
    }
}

getBrowser().webRequest.onBeforeRequest.addListener(
    window.requestListener,
    { urls: ["*://app.roll20.net/*"] },
    ["blocking"]);

console.log("window.r20es Background hook script initialized");
