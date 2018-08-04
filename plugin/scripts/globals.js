console.log("[r20es] payload.js is being injected.");

window.r20es = window.r20es || {};

function recvPluginMsg(e) {
    
    if(e.data.r20es_hooks) {
        e.stopPropagation();
        console.log("Page received hooks from backend!");
        window.r20es.hooks = e.data.r20es_hooks;
    }
}

window.removeEventListener("message", recvPluginMsg);
window.addEventListener("message", recvPluginMsg);

window.r20es.onAppLoad = window.r20es.onAppLoad || {listeners: []};

window.r20es.onAppLoad.fire = function() {
    if(window.r20es.isWindowLoaded) return;
    window.r20es.isWindowLoaded = true;

    for(let listener of window.r20es.onAppLoad.listeners) {
        listener();
    }
}

window.r20es.onAppLoad.addEventListener = function(fx) {
    window.r20es.onAppLoad.listeners.push(fx);
}

window.r20es.createElement = function(type, attributes, innerHTML) {
    let elem = document.createElement(type);
    for(let attribId in attributes) {
        elem.setAttribute(attribId, attributes[attribId]);
    }
    if(innerHTML)
        elem.innerHTML = innerHTML;

    return elem;
}

window.r20es.addSidebarSeparator = function(root) {
    function addClear() {
        let clear1 = document.createElement("div");
        clear1.className = "clear";
        clear1.style.height = 10;
        root.appendChild(clear1);
    }

    addClear();
    let hr = document.createElement("hr");
    root.appendChild(hr);
    addClear();
}

window.r20es.safeParseJson = function(str) {

    try {
        return JSON.parse(str);
    } catch(err) {
        alert("File is not a valid JSON file.");
    }
    return null;
} 

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

function sendChat(asWho, msg, callbackId) {
    if(!asWho) asWho = "R20ES";
    window.d20.textchat.doChatInput(`/w "${window.currentPlayer.get("displayname")}" &{template:default} {{name=${asWho}}} {{${msg}}}`, callbackId);
}

window.r20es.rollAndApplyHitDice = function(objects) {

    // tokens will locally disappear if we do not unselect them here
    let oldSel = window.d20.engine.selected();
    window.d20.engine.unselect();

    let numRolled = 0;

    console.log(window.r20es.hooks);
    
    for(let token of objects) {  
        console.log(token);

        if(!token.model || !token.model.character) continue;

        let attribs = token.model.character.attribs;
        let config  = window.r20es.hooks.rollAndApplyHitDice.config;        

        // find hpForumla
        let hpFormula = null;
        for(let attrib of attribs.models) {
            if(!hpFormula && attrib.attributes.name === config.diceFormulaAttribute) {
                hpFormula = attrib.attributes.current;
                break;
            }
        }

        if(!hpFormula) {
            sendChat("R20ES_HitDice", `Could not find attribute ${config.diceFormulaAttribute}`)
            continue;
        }

        // roll hpForumla
        let callbackId = generateUUID();
        sendChat("R20ES_HitDice", `${token.model.character.get("name")}: [[${hpFormula}]]`, callbackId);
    
        // apply hp formula in the roll callback
        $(document).on(`mancerroll:${callbackId}`, (_, o) => {
            $(document).off(`mancerroll:${callbackId}`);

            if(!o.inlinerolls || o.inlinerolls.length <= 0) return;

            let hp = o.inlinerolls[0].results.total;

            let barValue = config.bar + "_value";
            let barMax = config.bar + "_max";
            let save = {};
            save[barValue] = hp;
            save[barMax] = hp;
            token.model.save(save);

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
                    if(!obj.model || !obj.model.character) continue;
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
        return false;
    }

    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = callback;
    return true;
}

function importTablesFromJson(e) {
    let table = window.d20.Campaign.rollabletables.create();
    

    for(let id in e.items) {
        let item = e.items[id];
        delete item.id;

        table.tableitems.create(item);
    }
    
    delete e.id;
    delete e.items;
    table.save(e);
}

window.r20es.importTablesFromJson = function(e) {
    e = JSON.parse(e);
    importTablesFromJson(e);
}

window.r20es.importTablesFromTableExport = function(raw) {
    let tknIdx = 0;

    isspace = c => c === '\n' || c === '\r' || c === '\t' || c === ' ' || c === '\f' || c === '\v';
    isdigit = c => ((c>='0') && (c<='9'));

    function nextToken() {

        while(true) {
            if(raw.length <= tknIdx) break;
            var isExcl = raw[tknIdx] === '!';
            var isDashes = raw.length > (tknIdx + 1) && (raw[tknIdx] === '-' && raw[tknIdx+1] === '-' );

            if(isExcl || isDashes) break;

            tknIdx++;
        }

        if(raw.length <= tknIdx) return {eof: true};

        if(raw[tknIdx] === '!') {
            // command token
            tknIdx++

            let ret = {command: ""};
            while(true) {
                if(raw.length <= tknIdx) break;
                if(isspace(raw[tknIdx])) break;

                ret.command += raw[tknIdx++];
            }
            
            ret.command = ret.command.trim();
            return ret;

        } else if(raw[tknIdx] === '-') {
            // arg token
            tknIdx += 2;

            let ret = {arg: ""};

            function tryMatch(str, idx) {

                for(let i = 0; i < str.length; i++) {
                    if(idx >= raw.length) return null;
                    if(raw[idx] !== str[i]) return null;
                    idx++;
                }
        
                return {idx: idx};
            }

            function tryMatchEscapedAscii() {   
                let start = tryMatch("<%%", tknIdx);
                if(!start) 
                    return false;
                let numBuffer = "";

                let tempIdx = start.idx;
                while(raw.length > tempIdx && isdigit(raw[tempIdx])) {
                    numBuffer += raw[tempIdx++];
                }

                let end = tryMatch("%%>", tempIdx);
                if(!end) 
                    return false;

                let ascii = parseInt(numBuffer);
                if(ascii === NaN)
                    return false;

                tknIdx = end.idx;
                ret.arg += String.fromCharCode(ascii);

                return true;
            }

            function tryMatchEscapedSlashes() {
                let isEscapedSlash = tryMatch("[TABLEEXPORT:ESCAPE]", tknIdx);
                if(!isEscapedSlash) return false;

                tknIdx = isEscapedSlash.idx;
                ret.arg += "--";

                return true;
            }

            while(true) {
                if(raw.length <= (tknIdx+1)) break;
                if(raw[tknIdx] === '!') break;
                if(raw[tknIdx] === '-' && raw[tknIdx+1] === '-') break;

                if(tryMatchEscapedAscii()) continue;
                if(tryMatchEscapedSlashes()) continue;
                
                ret.arg += raw[tknIdx++];
            }
            
            ret.arg = ret.arg.trim();
            return ret;
        }

        alert(`Table export lexer matched unknown start of token: ${raw[tknIdx]}`);
        return null;
    }

    function nextStatement() {

        let token = nextToken();
        let ret = {};

        function readArgs(numArgs, who) {
            let tokens = [];
            
            for(let i = 0; i < numArgs; i++) {
                tokens[i] = nextToken();
                if(!tokens[i]) alert(`${who} expected ${numArgs}, got ${i+1}`);
            }

            return tokens;
        }
    
        do {
            if(token.command) {
                if(token.command === "import-table") {

                    ret.table = {};
                    let argTokens = readArgs(2, "import-table");
                    ret.table.name = argTokens[0].arg;
                    ret.table.showplayers = argTokens[1].arg === "show";
                    return ret;
                    
                } else if(token.command == "import-table-item") {
                    ret.item = {};
                    let argTokens = readArgs(4, "import-table-item");
                    ret.item.tableName =  argTokens[0].arg;
                    ret.item.name=  argTokens[1].arg;
                    ret.item.weight =  argTokens[2].arg;
                    ret.item.avatar =  argTokens[3].arg;
                    return ret;

                } else {
                    alert(`Unknown TableExport command: ${token.command}`);

                    // skip args
                    while(true) {
                        token = nextToken();
                        if(!token.arg) break;
                    }
                }
            } else if(token.eof) { 
                ret.eof = true; 
                return ret; 
            } else {
                alert(`Unexpected token: ${token}. Expected a command token.`);
            }
            
        }while(token.eof === undefined);
    }
    
    let statement = null;
    let tables = {};
    do {
        statement = nextStatement();
        if(statement.eof) break;
        else if(statement.table) {
            tables[statement.table.name] = statement.table;
        } else if(statement.item) {
            let table = tables[statement.item.tableName];

            if(table)  {
                table.items = table.items || {};

                delete statement.item.tableName;
                table.items[statement.item.name] = statement.item;
            } else {
                alert(`Table not found: ${statement.item.tableName}`);
            }
        }
        
    }while(statement.eof === undefined);

    for(let name in tables) {
        importTablesFromJson(tables[name]);
    }
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
    
    let json = JSON.stringify(table.attributes, null , 4);

    let jsonBlob = new Blob([json], { type: 'data:application/javascript;charset=utf-8' });
    saveAs(jsonBlob, table.get("name") + ".json");
}

window.r20es.replaceAll = function(where, find, replace) {
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    return where.replace(new RegExp(escapeRegExp(find), 'g'), replace);

}

window.r20es.onJournalDuplicate = function(id) {

    let note = d20.Campaign.handouts.get(id);
    let char = d20.Campaign.characters.get(id);

    if(char)  {
        char._getLatestBlob("notes", () => {});
        char._getLatestBlob("gmnotes", () => {});
        char._getLatestBlob("defaulttoken", () => {});

        if(!char.editview.el.firstElementChild) {
            char.editview.render();
        }

        setTimeout(() => {
            { $(char.editview.el).find(".duplicate").trigger("click"); }
        }, 1000);
    
    } else if(note) {
        var blobs = {};

        note._getLatestBlob("notes", (b) => {blobs.notes = b});
        note._getLatestBlob("gmnotes", (b) => {blobs.gmnotes = b});

        if(!note.editview.el.firstElementChild) {
            note.editview.render();    
        }

        let json = note.toJSON();
        delete json.id;

        let newNote = note.collection.create(json);

        setTimeout(() => {
            newNote.updateBlobs(blobs);
        }, 1000);
    }
}
