console.log("[r20es] payload.js is being injected.");

window.r20es = window.r20es || {};

window.r20es.getTransform = function (ctx) {
    if ('currentTransform' in ctx) {
        return ctx.currentTransform
    }
    // restructure FF's array to an Matrix like object
    else if (ctx.mozCurrentTransform) {
        let a = ctx.mozCurrentTransform;
        return { a: a[0], b: a[1], c: a[2], d: a[3], e: a[4], f: a[5] };
    }
};

window.r20es.getRotation = function (ctx) {
    let t = window.r20es.getTransform(ctx);
    let rad = Math.atan2(t.b, t.a);
    if (rad < 0) { // angle is > Math.PI
        rad += Math.PI * 2;
    }
    return rad;
};

window.r20es.getCustomLayerData = function (layer) {
    if (layer === "map") return { bigTxt: "MAP BACKGROUND", txt: "MP", bg: "rgba(255,255,0,0.5)" }
    else if (layer === "objects") return { bigTxt: "TOKENS (PLAYER VISIBLE)", txt: "TK", bg: "rgba(255,0,0,0.5)" }
    else if (layer === "gmlayer") return { bigTxt: "GAME MASTER TOKENS", txt: "GM", bg: "rgba(0,255,0,0.5)" }
    return { txt: layer, bg: "rgba(255,255,255,0.5)" }
}

window.r20es.tokenDrawBg = function (ctx, graphic) {

    let data = window.r20es.getCustomLayerData(graphic.model.get("layer"));

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2;

    ctx.rotate(-window.r20es.getRotation(ctx));

    let sz = 18
    ctx.font = "bold " + sz + "px Arial";
    let txtSize = ctx.measureText(data.txt);
    let offX = Math.floor(graphic.get("width") / 2) - txtSize.width;
    let offY = Math.floor(graphic.get("height") / 2);

    ctx.fillStyle = data.bg;
    ctx.fillRect(offX, offY - sz, txtSize.width, sz);

    ctx.strokeStyle = "rgba(0,0,0, 1)";
    ctx.fillStyle = "rgba(255,255,255, 1)";

    ctx.strokeText(data.txt, offX, offY);
    ctx.fillText(data.txt, offX, offY);

    ctx.restore();
};

function getCanvasObjById(id) {
    for(let obj of window.d20.engine.canvas._objects) {
        if(!obj.model) continue;

        if(obj.model.id === id) {
            return obj;
        }
    }
    return null;
}

window.r20es.selectInitiativeToken = function (data) {
    
    let obj = getCanvasObjById(data.id);
    if(obj) {
        window.d20.engine.unselect();
        window.d20.engine.select(obj);
    }
}

window.r20es.pingInitiativeToken = function (data) {
    
    let obj = getCanvasObjById(data.id);
    if(obj) {
        
        if(obj.model.get("layer") !== "objects") return;
        
        var y = {
            left: obj.left,
            top: obj.top,
            radius: -5,
            player: window.currentPlayer.id,
            pageid: window.d20.Campaign.activePage().id,
            currentLayer: window.currentEditingLayer,
        };

        d20.engine.pings[window.currentPlayer.id] = y;

        d20.engine.pinging = {
            downx: obj.left,
            downy: obj.top
        };
        
        d20.engine.renderTop();
    }
}

window.r20es.moveCameraTo = function(data) {
    if(data.id) data = getCanvasObjById(data.id);
    if(!data) return;

    var editor = $("#editor-wrapper")[0];

    editor.scrollTop = Math.floor(data.top * window.d20.engine.canvasZoom) - Math.floor(window.d20.engine.canvasHeight / 2) + 125 * window.d20.engine.canvasZoom;
    editor.scrollLeft = Math.floor(data.left * window.d20.engine.canvasZoom) - Math.floor(window.d20.engine.canvasWidth / 2) + 125 * window.d20.engine.canvasZoom;
}

window.r20es.rollAndApplyHitDice5eOGL = function(objects) {

    // tokens will locally disappear if we do not unselect them here
    let oldSel = window.d20.engine.selected();
    window.d20.engine.unselect();

    let numRolled = 0;
    // TODO: custom hpFormula name, custom bar?_* vars 
    for(let token of objects) {  
        console.log(token);

        if(!token.model || !token.model.character) continue;

        let attribs = token.model.character.attribs;

        // find hpForumla
        let hpFormula = null;
        for(let attrib of attribs.models) {
            if(!hpFormula && attrib.attributes.name === "npc_hpformula") {
                hpFormula = attrib.attributes.current;
                break;
            }
        }

        if(!hpFormula) continue;

        // roll hpForumla
        let callbackId = generateUUID();    
        window.d20.textchat.doChatInput(`/w gm [[${hpFormula}]]`, callbackId);
    
        // apply hp formula in the roll callback
        $(document).on(`mancerroll:${callbackId}`, (_, o) => {
            $(document).off(`mancerroll:${callbackId}`);

            if(!o.inlinerolls || o.inlinerolls.length <= 0) return;

            let hp = o.inlinerolls[0].results.total;

            token.model.save({bar3_max: hp, bar3_value: hp});

            // reselect when we're done processing all callbacks.
            numRolled++;
            if(numRolled >= objects.length) {
                for(let sel of oldSel)
                    window.d20.engine.select(sel);
            }
        });
    }
}

window.r20es.handleBulkMacroMenuClick = function(obj) {

    if(!obj.target) return;
    
    let action = obj.target.getAttribute("r20es-macro-action");
    if(!action) return;

    let sel = window.d20.engine.selected();
    window.d20.engine.unselect();
    window.r20es.readFile
    for(let obj of sel) {
        window.d20.engine.select(obj);
        window.d20.textchat.doChatInput(action);
        window.d20.engine.unselect();
    }

    window.d20.engine.unselect();

    window.d20.token_editor.removeRadialMenu();
    window.d20.token_editor.closeContextMenu();

    for(let obj of sel) {
        window.d20.engine.select(obj);
    }
}

window.r20es.handleBulkMacroObserverCallback = function(muts) {

    let sel = window.d20.engine.selected();
    if(sel.length <= 0) return;

    addMacro = (macro, arr) => arr[macro.get("id")] = { 
        name: macro.get("name"),
        action: macro.get("action")
    };

    let root = document.getElementById("r20es-bulk-macro-menu");
    if(!root || root.childElementCount > 0) return;
    
    for(var e of muts) {
        for(let node of e.addedNodes) {
            if(node.className && node.className === "actions_menu d20contextmenu") {
                
                let macros = {};

                for(let macro of window.currentPlayer.macros.models) {
                    addMacro(macro, macros);
                }

                // check if selection contains objects that represent the same char
                let firstId = null;
                let selCharacter = null;
                let areAllSame = true;
                for(let obj of sel) {
                    firstId = obj.model && obj.model.character ? obj.model.character.get("id") : null;
                    if(firstId) {
                        selCharacter = obj.model.character;
                        break;
                    }
                }
                
                for(let obj of sel) {
                    if(!obj.model || !obj.model.character) continwindow.r20es.readFileue;
                    if(obj.model.character.get("id") !== firstId) {
                        areAllSame = false;
                        break;
                    }
                }

                if(areAllSame) {    
                    for(let macro of selCharacter.abilities.models) {
                        addMacro(macro, macros);
                    }
                }

                // create menu options
                for(let id in macros) {
                    let macro = macros[id];
                    let elem = document.createElement("li");

                    macro.action = macro.action.replace("@{selected|", `@{${selCharacter.get("name")}|`);
                    elem.setAttribute("data-action-type", "r20es-bulk-macro-menu");
                    elem.setAttribute("r20es-macro-action", macro.action);
                    elem.innerHTML = macro.name;
                    elem.onclick = window.r20es.handleBulkMacroMenuClick;

                    root.appendChild(elem);
                }
            }
        }
    }
}

window.r20es.readFile = function(file, callback) {
    if(!file) {
        alert("No file given.");
        return;
    }

    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = callback;
}

window.r20es.importTablesFromJson = function(e) {
    let table = window.d20.Campaign.rollabletables.create();
    

    for(let id in e.items) {
        let item = e.items[id];
        delete item.id;

        console.log(item);

        table.tableitems.create(item);
    }
    
    delete e.id;
    delete e.items;
    table.save(e);
}

window.r20es.importTablesFromTableExport = function(e) {
    console.log(e);
}

function getTable(e) {

    let tableId = $(e.target).closest("div[r20es-table-id]")[0].getAttribute("r20es-table-id");
    if(!tableId) { alert("Failed to get table id."); return null; }

    let table = window.d20.Campaign.rollabletables.get(tableId); 
    if(!table) { alert(`Failed to get table. Table id: ${tableId}`); return null; }

    return table;
}

window.r20es.exportTableToJson = function(e) {
    let table = getTable(e);
    if(!table) return;
    console.log(table);
    
    let json = JSON.stringify(table.attributes, null , 4);
    console.log(json);

    var jsonBlob = new Blob([json], { type: 'data:application/javascript;charset=utf-8' });
    saveAs(jsonBlob, table.get("name") + ".json");
}

window.r20es.exportTableToTableExport= function(e) {
    console.log(e);
}