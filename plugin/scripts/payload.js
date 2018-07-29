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
};

window.r20es.pingInitiativeToken = function (data) {
    
    let obj = getCanvasObjById(data.id);
    if(obj) {
        
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
};

window.r20es.moveCameraTo = function(data) {
    if(data.id) data = getCanvasObjById(data.id);
    if(!data) return;

    var editor = $("#editor-wrapper")[0];

    editor.scrollTop = Math.floor(data.top * window.d20.engine.canvasZoom) - Math.floor(window.d20.engine.canvasHeight / 2) + 125 * window.d20.engine.canvasZoom;
    editor.scrollLeft = Math.floor(data.left * window.d20.engine.canvasZoom) - Math.floor(window.d20.engine.canvasWidth / 2) + 125 * window.d20.engine.canvasZoom;

    console.log("we panning!!");
}