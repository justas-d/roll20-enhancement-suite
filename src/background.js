import { hooks } from './hooks.js'
import { Config } from './tools/config.js';

function sendHooksToPort(port) {
    port.postMessage({ hooks: hooks });
    console.log("Background sent hooks to plugin to be sent to page");
}

function sendHooksToAllPorts() {
    let idx = ports.length;

    while (idx-- > 0) {
        let port = ports[idx];

        if (port.error) {
            console.log(`Port error: ${port.error}`);
            ports.splice(idx, 1);
            continue;
        }

        sendHooksToPort(port);
    }
}

function loadLocalStorage() {

    let get = {};

    for (let id in hooks) {
        get[id] = true;
    }

    browser.storage.local.get(get)
        .then(p => {

            for (var key in p) {
                let hook = hooks[key];
                let save = p[key];

                if (!hook) continue;

                let cfg = null;
                if (typeof (save) === "boolean") {
                    cfg = { enabled: true };
                } else {
                    cfg = save;
                }

                hook.config = Object.assign(hook.config, cfg); // overwrite defaults

                console.log(`localStorage: Loaded ${key}`);
                console.log(hook.config);
            }
        });


    // fill in required defaults
    for (let id in hooks) {
        let hook = hooks[id];

        if (!hook.config) {
            hook.config = {};
            hook.config.enabled = true;
        }
    }
}


function updateLocalStorage() {
    let save = {};

    for (let id in hooks) {
        let hook = hooks[id];
        save[id] = hook.config;
    }

    browser.storage.local.set(save);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function addModToQueueIfOk(dt, mod, queue) {
    if (mod.includes && dt.url.includes(mod.includes)) {
        queue.push(mod);
    }
}

function requestListener(dt) {

    let hookQueue = [];
    for (let id in hooks) {
        let hook = hooks[id];

        if (!hook.config.enabled) continue;

        if (hook.mods) {
            for (let mod of hook.mods) {
                addModToQueueIfOk(dt, mod, hookQueue);
            }
        } else {
            addModToQueueIfOk(dt, hook, hookQueue);
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
        for (let mod of hookQueue) {
            if (!mod.find || !mod.patch) continue;

            // TODO : @TESTING use replacer function here https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
            // to know if we have replaced at all and whether we have replaced the expected amount of matches.
            str = str.replace(new RegExp(escapeRegExp(mod.find), 'g'), mod.patch);
            console.log(`[${mod.includes}] [${mod.find}] done!`);

        }

        filter.write(encoder.encode(str));
        filter.close();
    };
}

loadLocalStorage();

let ports = [];

browser.runtime.onConnect.addListener(port => {
    console.log("Background established new port");

    ports.push(port);

    port.onMessage.addListener(e => {
        if (e.request && e.request === "hooks") {
            sendHooksToPort(port)
        }
    });
});

browser.runtime.onMessage.addListener((msg) => {
    console.log("Background received message!");
    console.log(msg);

    if (msg.background) {
        if (msg.background.type === "get_hooks") {

            // avoids DOM clone exceptions
            const hookData = JSON.parse(JSON.stringify(hooks, null, 4));
            const payload = { popup: { hooks: hookData, type: "receive_hooks" } };

            browser.runtime.sendMessage(Config.extentionId, payload);

            console.log("Background sent message to popup.");
            console.log(payload);
        }
        if (msg.background.type === "update_hook_config") {
            console.log(`Background is updating hook config for ${msg.background.hookId}`);

            let hook = hooks[msg.background.hookId];

            hook.config = Object.assign(hook.config, msg.background.config);
            console.log(hook.config);

            updateLocalStorage();
            sendHooksToAllPorts();
        }
    }
});

browser.webRequest.onBeforeRequest.addListener(
    requestListener,
    { urls: ["*://app.roll20.net/*"] },
    ["blocking"]);

console.log("window.r20es Background hook script initialized");