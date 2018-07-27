window.r20es = window.r20es || {};

window.r20es.hooks = [
    {
        enabled: true,
        name: "Developer mode",
        id: "dev_mode",
        includes: "/editor/startjs/",
        find: "environment: \"production\"",
        patch: "environment: \"development\"",
    },

    {
        enabled: true,
        name: "Token layer drawing (GM Only)",
        id: "token_layer_drawing",
        includes: "assets/app.js",
        find: "this.model.view.updateBackdrops(e),this.active",
        patch: "this.model.view.updateBackdrops(e), window.is_gm && window.r20es.tokenDrawBg(e, this), this.active",
    }
];

{
    let keys = {};
    for(let i = 0; i < window.r20es.hooks.length; i++) {
        keys[window.r20es.hooks[i].id] = true;
    }

    console.log(keys);

    browser.storage.local.get(keys)
        .then(p => {
            console.log(p);
            for(var key in p) {
                for(let hook of window.r20es.hooks) {
                    if(hook.id === key) {
                        hook.enabled = p[key];
                        console.log(`${key}: ${hook.enabled}`);
                    }
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
            save[hook.id] = hook.enabled;
            browser.storage.local.set(save);
        }
    }
});

function listener(dt) {
    for(let hook of window.r20es.hooks) {
        if(!hook.enabled) continue;

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
                str = str.replace(hook.find, hook.patch);
                console.log(`[${hook.includes}] done!`);
                
                filter.write(encoder.encode(str));
                filter.close();
            };
        }
    }
}

browser.webRequest.onBeforeRequest.addListener(
    listener,
    {urls: ["*://app.roll20.net/*"]},
    ["blocking"]);

console.log("r20es Background hook script initialized");


