window.r20es = window.r20es || {};

window.r20es.hooks = {

    expose_d20: {
        enabled: true,
        force: true,

        includes: "assets/app.js",
        find: "window.d20=d20)",
        patch: "window.d20=d20);window.d20=d20;",
    },

    /*
    debugger: {
        enabled: true,
        force: true,

        includes: "assets/app.js",

        find: 'else t=$(this).attr("data-macroid");',
        patch: 'else t=$(this).attr("data-macroid");debugger;'
    },
    */

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

        inject: "scripts/draw_current_layer.js",

        mods: [
            {
                includes: "assets/app.js",
                find: "this.model.view.updateBackdrops(e),this.active",
                patch: "this.model.view.updateBackdrops(e), window.is_gm && window.r20es.tokenDrawBg(e, this), this.active"

            },

            {
                includes: "assets/app.js",
                find: "function setMode(e){",
                patch: "function setMode(e){if(window.r20es) window.r20es.setModePrologue(e);",
            }
        ]
    },

    seenad_override: {
        enabled: true,
        name: "Skip ad",

        includes: "/editor/startjs/",
        find: "d20ext.showGoogleAd();",
        patch: 'window.d20ext.seenad = !0, $("#loading-overlay").find("div").hide(), window.currentPlayer && d20.Campaign.pages.length > 0 && d20.Campaign.handlePlayerPageChanges(), void $.get("/editor/startping/true");'
    },

    bulk_macros: {
        enabled: true,
        name: "Bulk macros",

        mods: [

            { // for logic
                includes: "assets/app.js",
                find: "d20.textchat.doChatInput=function(t,n){",
                patch: `d20.textchat.doChatInput=function(t,n){
let r20es_selected = d20.engine.selected();
let r20es_len = r20es_selected.length;
if(r20es_len <= 0) r20es_len = 1;
for(var r20es_i = 0; r20es_i < r20es_len; r20es_i++) {
    let r20es_injected_obj = 
        (r20es_i < r20es_selected.length && r20es_selected[r20es_i].model)
            ? r20es_selected[r20es_i]
            : null;`
            },

            { // closing brace
                includes: "assets/app.js",
                find: '}else console.log("No document!")',
                patch: '}else console.log("No document!")}'
            },

            { // inject object
                includes: "assets/app.js",
                find: "var l=d20.engine.selected();l.length>0&&l[0].model&&(a.currentSelected=l[0]);",
                patch: "a.currentSelected = r20es_injected_obj;"
            }
        ]
    },

    character_io: {
        enabled: true,
        name: "Character Exporter/Importer",

        inject: "scripts/character_io.js",
    },

    auto_select_next_token: {
        enabled: true,
        name: "Select token on its turn",

        includes: "assets/app.js",
        find: "e.push(t[0]);",
        patch: "e.push(t[0]);window.r20es.selectInitiativeToken(e[0]);"
    },

    auto_ping_next_token: {
        enabled: true,
        name: "Ping token on its turn",

        includes: "assets/app.js",
        find: "e.push(t[0]);",
        patch: "e.push(t[0]);window.r20es.pingInitiativeToken(e[0]);"
    },

    auto_focus_next_token: {
        enabled: true,
        name: "Move local camera to token on its turn",

        includes: "assets/app.js",
        find: "e.push(t[0]);",
        patch: "e.push(t[0]);window.r20es.moveCameraTo(e[0]);"
    }
};

browser.runtime.onConnect.addListener(port => {
    port.postMessage({hooks: window.r20es.hooks});
});

{
    let localKeys = {};

    for(let id in window.r20es.hooks) {
        if(localKeys[id] && localKeys[id].force) continue;

        localKeys[id] = true;
    }

    browser.storage.local.get(localKeys)
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
            let hook = window.r20es.hooks[msg.background.hookId];
            hook.enabled = msg.background.state;

            let save = {};
            save[msg.background.hookId] = hook.enabled;
            browser.storage.local.set(save);
        }
    }
});

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function addModToQueueIfOk(dt, mod, queue) {
    if(mod.includes && dt.url.includes(mod.includes)) {
        queue.push(mod);
    }
}

function listener(dt) {

    let hooks = [];
    for(let id in window.r20es.hooks) {
        let hook = window.r20es.hooks[id];

        if(!hook.enabled) continue;

        if(hook.mods) {
            for(let mod of hook.mods) {
                addModToQueueIfOk(dt, mod, hooks);
            }
        } else {
            addModToQueueIfOk(dt, hook, hooks);
        }
    }

    if(hooks.length <= 0) return;
    console.log(hooks);

    let filter = browser.webRequest.filterResponseData(dt.requestId);
    let decoder = new TextDecoder("utf-8");
    let encoder = new TextEncoder();

    let str = "";
    filter.ondata = event => {
        str += decoder.decode(event.data, {stream: true});
    };

    filter.onstop = _ => {
        console.log("we in there");
        console.log(hooks);

        for(let mod of hooks) {
            if(!mod.find || !mod.patch) continue;

            str = str.replace(new RegExp(escapeRegExp(mod.find), 'g'), mod.patch);
            console.log(`[${mod.includes}] [${mod.find}] done!`);

        }

        filter.write(encoder.encode(str));
        filter.close();
    };
}

browser.webRequest.onBeforeRequest.addListener(
    listener,
    {urls: ["*://app.roll20.net/*"]},
    ["blocking"]);

console.log("r20es Background hook script initialized");


