import { hooks } from './Hooks.js'
import { ModPatchTesting } from './tools/ModPatchTesting.js';
import { escapeRegExp, getBrowser } from './tools/MiscUtils.js';

window.modPatchTesting = new ModPatchTesting(hooks);

let redirectCount = 0;
let hasBeenRedirected = {};
let redirectTargets = [
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

function getHooks(hooks) {

    let hookQueue = [];

    function addModToQueueIfOk(dt, mod, hook) {
        if (mod.includes && dt.url.includes(mod.includes)) {
            hookQueue.push({ mod: mod, hook: hook });
        }
    }

    for (let id in hooks) {
        let hook = hooks[id];

        if (hook.mods) {
            for (let mod of hook.mods) {
                addModToQueueIfOk(dt, mod, hook);
            }
        } else {
            addModToQueueIfOk(dt, hook, hook);
        }
    }

    return hookQueue;
}

function injectHooks(intoWhat, hookQueue) {
    for (let combo of hookQueue) {
        const mod = combo.mod;
        const hook = combo.hook;

        if (!mod.find || !mod.patch) continue;

        intoWhat = intoWhat.replace(new RegExp(escapeRegExp(mod.find), 'g'), mod.patch);

        console.log(`[${mod.includes}] [${mod.find}] done!`);
    }
}

function setupEnvironment() {
    window.r20esChrome = {
        scriptQueue: [],
        readyCallbacks: []
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

    window.r20esChrome.fetchAndInject = function (localUrl) {
        fetch(localUrl, { method: "GET", mode: "same-origin", headers: { "Accept": "application/javascript" } })
            .then(response => {

                console.log(response);

                response.text().then(text => {

                    text = text.replace(
                        "jQuery.ready.promise().done( fn );",
                        "window.r20esChrome.readyCallbacks.push(fn);");

                    text = text.replace("var d20=d20||{};", "var d20=d20||{};window.d20=d20;");

                    const blob = new Blob([text], { type: "application/json" });

                    const url = window.URL.createObjectURL(blob);
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

                        console.log("scripts injected.");

                        setTimeout(() => {
                            window.r20esChrome.readyCallbacks.each(f => f());
                        }, 1000);
                    }
                })
            });
    }

    console.log("init environment");
}

function requestListener(dt) {

    if (chrome) {

        if (dt.url === "https://app.roll20.net/editor/") {
            console.log("RESET REDIRECT TABLE");
            hasBeenRedirected = {};
            redirectCount = 0;
        }
        else if (redirectTargets.find(f => dt.url.startsWith(f))) {
            if (hasBeenRedirected[dt.url]) {
                console.log(`SKIP ${dt.url}`);
                return;
            }

            const scriptString = _ => `window.r20esChrome.fetchAndInject("${dt.url}");`;

            let payload = null;
            if (redirectCount <= 0) {
                payload = setupEnvironment.toString() + ";setupEnvironment();" + scriptString();
            } else {
                payload = scriptString();
            }

            hasBeenRedirected[dt.url] = true;
            ++redirectCount;

            console.log(`redirecting ${dt.url}`);

            return { redirectUrl: `data:application/javascript;base64,${btoa(payload)}` };
        }
    } else {
        let hookQueue = [];
        for (let id in hooks) {
            let hook = hooks[id];

            if (hook.mods) {
                for (let mod of hook.mods) {
                    addModToQueueIfOk(dt, mod, hookQueue, hook);
                }
            } else {
                addModToQueueIfOk(dt, hook, hookQueue, hook);
            }
        }

        if (hookQueue.length <= 0) return;


        let filter = getBrowser().webRequest.filterResponseData(dt.requestId);
        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        let str = "";
        filter.ondata = event => {
            str += decoder.decode(event.data, { stream: true });
        };

        filter.onstop = _ => {
            for (let combo of hookQueue) {
                const mod = combo.mod;
                const hook = combo.hook;

                if (!mod.find || !mod.patch) continue;

                str = str.replace(new RegExp(escapeRegExp(mod.find), 'g'), _ => {
                    window.modPatchTesting.onModHooked(mod, hook);
                    return mod.patch;
                });
                console.log(`[${mod.includes}] [${mod.find}] done!`);

            }

            filter.write(encoder.encode(str));
            filter.close();
        };
    }
}

if (chrome) {
    function headerCallback(req) {
        if (req.url !== "https://app.roll20.net/editor/") return;

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
        { urls: ["https://app.roll20.net/editor/"] },
        ["blocking", "responseHeaders"]);
}

getBrowser().webRequest.onBeforeRequest.addListener(
    requestListener,
    { urls: ["*://app.roll20.net/*"] },
    ["blocking"]);

console.log("window.r20es Background hook script initialized");
