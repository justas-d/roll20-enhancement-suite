window.r20es = window.r20es || {};

window.r20es.hooks = {

    dev_mode: {
        enabled: true,
        name: "Developer mode",
        includes: "/editor/startjs/",

        find: "environment: \"production\"",
        patch: "environment: \"development\"",
    },


    token_layer_drawing: {
        enabled: true,
        name: "Token layer drawing (GM Only)",
        includes: "assets/app.js",

        find: "this.model.view.updateBackdrops(e),this.active",
        patch: "this.model.view.updateBackdrops(e), window.is_gm && window.r20es.tokenDrawBg(e, this), this.active",
    },

    seenad_override: {
        enabled: true,
        name: "Skip ad",
        includes: "assets/app.js",

        find: "showGoogleAd=function(){",
        patch: "showGoogleAd=function(){return;"
    }
};

browser.runtime.onConnect.addListener(port => {
    port.postMessage({hooks: window.r20es.hooks});
});

{
    let keys = {};

    for(let id in window.r20es.hooks) {
        keys[id] = true;
    }

    browser.storage.local.get(keys)
        .then(p => {
            for(var key in p) {
                let hook = window.r20es.hooks[key];
                if(hook) {
                    hook.enabled = p[key];
                }
            }
        });
}

browser.runtime.onMessage.addListener((msg) => {
    if(msg.background) {
        if(msg.background.type === "get_hooks") {
            browser.runtime.sendMessage(null, {
                popup: {hooks: window.r20es.hooks, type: "receive_hooks"}
            });
        }
        if(msg.background.type === "update_hook_enabled") {
            console.log("received!");
            let hook = window.r20es.hooks[msg.background.hookId];
            hook.enabled = msg.background.state;

            let save = {};
            save[msg.background.hookId] = hook.enabled;
            browser.storage.local.set(save);
        }
    }
});

function tryPatch(dt, hook, mod) {
    if(dt.url.includes(hook.includes)) {
        console.log(`[${hook.includes}] patching`);
        let filter = browser.webRequest.filterResponseData(dt.requestId);
        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        let str = "";
            filter.ondata = event => {
            str += decoder.decode(event.data, {stream: true});
        };

        filter.onstop = event => {
            str = str.replace(mod.find, mod.patch);
            console.log(`[${hook.includes}] [${mod.find}] done!`);
            
            filter.write(encoder.encode(str));
            filter.close();
        };
    }
}

function listener(dt) {
    for(let id in window.r20es.hooks) {
        let hook = window.r20es.hooks[id];

        if(!hook.enabled) continue;

        if(hook.mods) {
            for(let mod of hook.mods) {
                tryPatch(dt, hook, mod);
            }
        } else {
            tryPatch(dt, hook, hook);
        }
    }
}

browser.webRequest.onBeforeRequest.addListener(
    listener,
    {urls: ["*://app.roll20.net/*"]},
    ["blocking"]);

console.log("r20es Background hook script initialized");


