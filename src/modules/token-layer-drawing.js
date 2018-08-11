import { R20Module } from "../tools/r20Module";
import { getLayerData } from "../tools/layerData";
import { getRotation } from "../tools/miscUtil";
import { R20 } from "../tools/r20api";

class TokenLayerDrawing extends R20Module.SimpleBase {
    setup() {
        window.r20es.tokenDrawBg = function (ctx, graphic) {

            const data = getLayerData(graphic.model.get("layer"));

            ctx.save();
            ctx.globalAlpha = 1;
            ctx.lineWidth = 2; // TODO : config for this

            ctx.rotate(-getRotation(ctx));

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

        R20.renderAll();
    }

    dispose() {
        R20.renderAll();
        window.r20es.tokenDrawBg = null;
    }
}

if (R20Module.canInstall()) new TokenLayerDrawing(__filename).install();

const hook = R20Module.makeHook(__filename,{
    id: "tokenLayerDrawing",
    name: "Token layer drawing",
    description: "Draws an indicator at the bottom left of each token that indicates which layer it is on.",
    category: R20Module.category.canvas,
    gmOnly: true,

    includes: "assets/app.js",
    find: "this.model.view.updateBackdrops(e),this.active",
    patch: "this.model.view.updateBackdrops(e), window.is_gm && window.r20es && window.r20es.tokenDrawBg && window.r20es.tokenDrawBg(e, this), this.active"
});

export { hook as TokenLayerDrawingHook };