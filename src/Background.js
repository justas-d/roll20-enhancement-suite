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

let hasBeenRedirected = false;
let payload = null;

let redirectPayload = btoa(`
{
let s = document.createElement("script");
s.src = "/r20es-chrome-hack";
document.head.appendChild(s);
}`
);

function requestListener(dt) {

    if (chrome) {

        if (dt.url.includes("/editor/")) { hasBeenRedirected = false; }

        else if (dt.url.includes("/r20es-chrome-hack")) {
            console.log("INTERCEPT!");
            //if (payload === null) {
                //return { redirectUrl: `data:application/javascript;base64,${redirectPayload}` };
            //}

          //  console.log(payload);
            //const url = window.URL.createObjectURL(payload);
            
            //console.log("PAYLOAD INTERCEPTED!");

            /*
                 SOME IDEAS:

                 * Isolate the unsafe script part of the payload
                    * replace alert with non https:// urls see wot happens
                 * Inject a script the eval's the code?
                 * EVAL THE CODE FROM HERE? window.eval?
            */

            //const wtf = btoa(`eval("${}")`);
            //return { redirectUrl: `data:application/javascript;base64,${wtf}`};

            /*
            str = str.replace(new RegExp(escapeRegExp(mod.find), 'g'), _ => {
                window.modPatchTesting.onModHooked(mod, hook);
                return mod.patch;
            });
            */
           //window.URL.revokeObjectURL(url);

         //  return { redirectUrl: `data:application/javascript;base64,${btoa("alert('still_going');")}`};
           //return { redirectUrl: "javascript:"+payload };

            //const b64 = btoa(payload);
            //console.log(b64.substring(0,5000));
            //const b64 = btoa("alert('pwd')");

            //return { redirectUrl: `data:application/javascript;base64,${b64}` };
            return {cancel: true};
        }

        else if (dt.url.includes("app.js")) {
            
            if (hasBeenRedirected) return;
            hasBeenRedirected = true;

            /*
            console.log(dt.url);
            console.log("dispached fetch");
            fetch(dt.url).then(response => {
                console.log("fetch response");
                /*
                response.blob().then(data => {
                    payload = data;
                });
                
                
                response.text().then(data => {
                    console.log("text response");
                    payload = data;
                });
                
            });

       
            /*
            let s = document.createElement("script");
            s.text = "fetch("/r20es-chrome-hack", {mode: 'no-cors'});";
            document.head.appendChild(s);
            */

            console.log("redirecting...");

            const payload = `
        
                fetch("https://app.roll20.net/assets/app.js?1534264843")
                .then(response => {
                
                    console.log(response);
                
                    response.blob().then(blob => {
                
                        const url = window.URL.createObjectURL(blob);
                        console.log(blob);
                
                        let s = document.createElement("script");
                        s.src = url;
                        s.async = false;
                        document.head.appendChild(s);
                        
                        
                        console.log("content script done");
                    })
                })

                {
                    let s = document.createElement("script");
                    s.src = "/r20es-chrome-hack";
                    s.async = false;
                    document.head.appendChild(s);
                    }
                `
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
