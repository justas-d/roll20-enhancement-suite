import { hooks } from './hooks.js'
import { ModPatchTesting } from './tools/modPatchTesting.js';
import { escapeRegExp } from './tools/miscUtil.js';

window.modPatchTesting = new ModPatchTesting(hooks);

function addModToQueueIfOk(dt, mod, queue, hook) {
    if (mod.includes && dt.url.includes(mod.includes)) {
        queue.push({mod: mod, hook: hook});
    }
}

function requestListener(dt) {

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

    let filter = browser.webRequest.filterResponseData(dt.requestId);
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

browser.webRequest.onBeforeRequest.addListener(
    requestListener,
    { urls: ["*://app.roll20.net/*"] },
    ["blocking"]);

console.log("window.r20es Background hook script initialized");