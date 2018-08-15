import { hooks } from './Hooks.js'
import { ModPatchTesting } from './tools/ModPatchTesting.js';
import { escapeRegExp, getBrowser } from './tools/MiscUtils.js';
import { saveAs } from 'save-as';

window.modPatchTesting = new ModPatchTesting(hooks);

function addModToQueueIfOk(dt, mod, queue, hook) {
    if (mod.includes && dt.url.includes(mod.includes)) {
        queue.push({ mod: mod, hook: hook });
    }
}

let hasBeenRedirected = {};

function requestListener(dt) {

    if (chrome) {

        if (dt.url.includes("/editor/")) {
            //hasBeenRedirected = {};
        }

        if (dt.url.includes("js")) {
            if (hasBeenRedirected[dt.url]) {
                console.log(`SKIP ${dt.url}`);
                return;
            }

            hasBeenRedirected[dt.url] = true;


            console.log(`redirecting ${dt.url}`);

            /*
            Note(Justas): so this kinda works but the main problem is that the state of the DOM is not what the scripts were designed for.
                          I have no idea what that state is and if it's even possible to reset the DOM to that state.
            */

            const payload = `
{
            let order = [
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

                const localUrl = "${dt.url}";
                

                fetch(localUrl, {method: "GET", mode: "same-origin", headers: {"Accept": "application/javascript"}})
                .then(response => {
                
                    console.log(response);
                
                    response.text().then(text => {
                        
                        text = text.replace("soundManager.url = '/js/soundmanager/';", "soundManager = {};soundManager.url = '/js/soundmanager/';");
                        const blob = new Blob([text], {type: "application/json"});

                        const url = window.URL.createObjectURL(blob);
                        console.log(blob);
                
                        window.r20esChrome = window.r20esChrome || [];
                        window.r20esChrome.push({url: localUrl, elem: url});

                        console.log("content script done");

                        if(window.r20esChrome.length >= 10) {
                            for(const url of order) {
                                for(const data of window.r20esChrome) {
                                    if(data.url.startsWith(url)) {

                                        let s = document.createElement("script");
                                        s.src = data.elem;
                                        s.async = false;
                
                                        document.body.appendChild(s);
                                        break;
                                    }
                                }
                            }
                            console.log("the thing happens now");
                        }
                    })
                })
            }`
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

            // TODO : don't just kill the CSP header
            if (header.name !== "content-security-policy") continue;
            console.log(header);

            //header.value += " data: blob:"
            headers.splice(idx, 1);
            break;
        }

        return { responseHeaders: headers };
    }

    chrome.webRequest.onHeadersReceived.addListener(
        headerCallback,
        { urls: ["*://app.roll20.net/*"] },
        ["blocking", "responseHeaders"]);
}

getBrowser().webRequest.onBeforeRequest.addListener(
    requestListener,
    { urls: ["*://app.roll20.net/*"] },
    ["blocking"]);

console.log("window.r20es Background hook script initialized");
