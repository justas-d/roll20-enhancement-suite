console.log("[r20es] payload.js is being injected.");

window.r20es = window.r20es || {};

window.r20es.getTransform = function (ctx) {
  if ('currentTransform' in ctx) {
    return ctx.currentTransform
  }
  // restructure FF's array to an Matrix like object
  else if (ctx.mozCurrentTransform) {
    let a = ctx.mozCurrentTransform;
    return {a:a[0], b:a[1], c:a[2], d:a[3], e:a[4], f:a[5]};
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

window.r20es.getCustomLayerData = function(layer) {
    if(layer === "map") return {bigTxt: "MAP BACKGROUND", txt: "MP", bg: "rgba(255,255,0,0.5)"}
    else if(layer === "objects") return {bigTxt: "TOKENS (PLAYER VISIBLE)", txt: "TK", bg: "rgba(255,0,0,0.5)"}
    else if(layer === "gmlayer") return {bigTxt: "GAME MASTER TOKENS", txt: "GM", bg: "rgba(0,255,0,0.5)"}
    return {txt: layer, bg: "rgba(255,255,255,0.5)"}
}

window.r20es.tokenDrawBg = function(ctx, graphic) {

    let data = window.r20es.getCustomLayerData(graphic.model.get("layer"));

    ctx.save();
    ctx.rotate(-window.r20es.getRotation(ctx));

    let sz = 18
    ctx.font = "bold " + sz + "px Arial";
    let txtSize = ctx.measureText(data.txt);
    let offX = Math.floor(graphic.get("width")/2) - txtSize.width;
    let offY = Math.floor(graphic.get("height")/2);

    ctx.fillStyle = data.bg;
    ctx.fillRect(offX, offY-sz, txtSize.width, sz);

    ctx.strokeStyle= "rgba(0,0,0, 1)";
    ctx.fillStyle= "rgba(255,255,255, 1)";
    
    ctx.strokeText(data.txt, offX, offY);
    ctx.fillText(data.txt, offX, offY);

    ctx.restore();
};

