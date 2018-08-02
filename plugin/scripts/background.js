window.r20es = window.r20es || {};

function addCategoryElemToCanvasTokenRightClickMenu(name, actionType, callback) {
    return [
        {
            includes: "/editor/",
            find: "<li class='head hasSub' data-action-type='addturn'>Add Turn</li>",
            patch: `<li class='head hasSub' data-action-type='addturn'>Add Turn</li>
<li class="head hasSub" data-menuname="${actionType}"> ${name} »
<ul class="submenu" id="${actionType}" data-menuname="${actionType}" style="width: auto;display: none;">

</ul>`,
        }
    ];
}


function addElemToCanvasTokenRightClickMenu(name, actionType, callback) {
    return [
        {
            includes: "/editor/",
            find: "<li class='head hasSub' data-action-type='addturn'>Add Turn</li>",
            patch: `<li class='head hasSub' data-action-type='addturn'>Add Turn</li>
<li class='head hasSub' data-action-type='${actionType}'>${name}</li>`,
        },

        {
            includes: "assets/app.js",
            find: `else if("toback"==e)`,
            patch: `else if("${actionType}"==e) window.r20es.${callback}(n), i(), d20.token_editor.removeRadialMenu();else if("toback"==e)`
        }
    ];
}

window.r20es.hooks = {
    
    exposeD20: {
        
        force: true,

        includes: "assets/app.js",
        find: "var d20=d20||{};",
        patch: "var d20=d20||{};window.d20=d20;"
    },

    devMode: {
        name: "Developer mode",

        includes: "/editor/startjs/",
        find: "environment: \"production\"",
        patch: "environment: \"development\"",
    },


    tokenLayerDrawing: {
        
        name: "Token layer drawing (GM Only)",

        inject: ["scripts/draw_current_layer.js"],

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

    seenadOverride: {
        
        name: "Skip ad",

        includes: "/editor/startjs/",
        find: "d20ext.showGoogleAd();",
        patch: 'window.d20ext.seenad = !0, $("#loading-overlay").find("div").hide(), window.currentPlayer && d20.Campaign.pages.length > 0 && d20.Campaign.handlePlayerPageChanges(), void $.get("/editor/startping/true");'
    },

    characterImportExport: {
        
        name: "Character Exporter/Importer",

        inject: ["scripts/character_io.js"],
    },

    autoSelectNextToken: {
        
        name: "Select token on its turn",

        includes: "assets/app.js",
        find: "e.push(t[0]);",
        patch: "e.push(t[0]);window.r20es.selectInitiativeToken(e[0]);"
    },

    autoFocusNextToken: {
        
        name: "Move local camera to token on its turn",

        includes: "assets/app.js",
        find: "e.push(t[0]);",
        patch: "e.push(t[0]);window.r20es.moveCameraTo(e[0]);"
    },

    autoPingNextToken: {
        
        name: "Ping tokens visible to players on their turns",

        includes: "assets/app.js",
        find: "e.push(t[0]);",
        patch: "e.push(t[0]);window.r20es.pingInitiativeToken(e[0]);"
    },

    rollAndApplyHitDice: {
        

        name: "Roll and apply hit dice",

        mods: addElemToCanvasTokenRightClickMenu("Hit Dice", "r20es-hit-dice", "rollAndApplyHitDice"),

        configView: {
            diceFormulaAttribute: {
                display: "Hit dice formula attribute",
                type: "string",
            },
            bar: {
                display: "HP Bar",
                type: "dropdown",

                dropdownValues: {
                    bar1: "Bar 1",
                    bar2: "Bar 2",
                    bar3: "Bar 3"
                },
            }
        },

        config: {
            diceFormulaAttribute: "npc_hpformula",
            bar: "bar1",
        }
    },

    bulkMacros: {
     
        name: "Bulk macros",

        inject: ["scripts/bulk_macros.js"],
        mods: addCategoryElemToCanvasTokenRightClickMenu("Bulk Roll", "r20es-bulk-macro-menu", "handleBulkMacroMenuClick")
    },

    importExportTable: {
        
        name: "Table Import/export",
        inject: ["scripts/import_export_table.js"],

        mods: [
            { // export buttons
                includes: "/editor/",
                find: "<button class='btn btn-danger deleterollabletable'>Delete Rollable Table</button>",
                patch: `<button class='btn r20es-table-export-json'>Export</button>
<button class='btn btn-danger deleterollabletable'>Delete Rollable Table</button>`
            },

            { // add table id to popup
                includes: "assets/app.js",
                find: `this.$el.on("click",".deleterollabletable"`,
                patch: `this.el.setAttribute("r20es-table-id", this.model.get("id")),this.$el.on("click",".deleterollabletable"`,                    
            }
        ]

    }
};

let ports = [];

function sendHooksToPort(port) {
    port.postMessage({hooks: window.r20es.hooks});   
    console.log("Background sent hooks to plugin to be sent to page");
}

function sendHooksToAllPorts() {
    let idx = ports.length;

    while(idx --> 0) {
        let port = ports[idx];
        
        if(port.error) {
            console.log(`Port error: ${port.error}`);
            ports.splice(idx, 1);
            continue;
        }

        sendHooksToPort(port);
    }
}

browser.runtime.onConnect.addListener(port => {
    console.log("Background established new port");

    ports.push(port);

    port.onMessage.addListener(e => {
        if(e.request && e.request === "hooks")
            sendHooksToPort(port)
    });
});

function loadLocalStorage() {

    let get = {};

    for(let id in window.r20es.hooks) {
        get[id] = true;
    }
    
    browser.storage.local.get(get)
        .then(p => {
           
            for(var key in p) {
                let hook = window.r20es.hooks[key];
                let save = p[key];
                
                if(!hook) continue;

                if(typeof(save) === "boolean") {
                    hook.config = {enabled: true};
                } else {
                    hook.config = save;
                }
                
                console.log(`localStorage: Loaded ${key}`);
                console.log(hook.config);
            }
        });

    
    // fill in required defaults
    for(let id in window.r20es.hooks) {
        let hook = window.r20es.hooks[id];
        
        if(!hook.config) {
            hook.config = {};
            hook.config.enabled = true;
        }
    }
}

loadLocalStorage();

function updateLocalStorage() {
    let save = {};

    for(let id in window.r20es.hooks) {
        let hook = window.r20es.hooks[id];
        save[id] = hook.config;
    }

    browser.storage.local.set(save);
}

browser.runtime.onMessage.addListener((msg) => {
    if(msg.background) {
        if(msg.background.type === "get_hooks") {
            browser.runtime.sendMessage(null, {
                popup: {hooks: window.r20es.hooks, type: "receive_hooks"}
            });
        }
        if(msg.background.type === "update_hook_config") {
            let hook = window.r20es.hooks[msg.background.hookId];
            
            hook.config = Object.assign(hook.config, msg.background.config);
            console.log(hook.config);

            updateLocalStorage();
            sendHooksToAllPorts();
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

        if(!hook.config.enabled) continue;

        if(hook.mods) {
            for(let mod of hook.mods) {
                addModToQueueIfOk(dt, mod, hooks);
            }
        } else {
            addModToQueueIfOk(dt, hook, hooks);
        }
    }

    if(hooks.length <= 0) return;

    let filter = browser.webRequest.filterResponseData(dt.requestId);
    let decoder = new TextDecoder("utf-8");
    let encoder = new TextEncoder();

    let str = "";
    filter.ondata = event => {
        str += decoder.decode(event.data, {stream: true});
    };

    filter.onstop = _ => {
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


