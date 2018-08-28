import { R20Module } from "../tools/R20Module";
import { LayerData } from "../tools/LayerData";
import { getRotation } from "../tools/MiscUtils";
import { R20 } from "../tools/R20";

class TokenLayerDrawing extends R20Module.SimpleBase {
    constructor() {
        super(__filename);
        this.drawOverlay = this.drawOverlay.bind(this);
    }

    drawOverlay(ctx: CanvasRenderingContext2D, graphic: Roll20.CanvasObject) {
        // careful here: tokenDrawBg will run in the renderer and crash recovery requires a referesh
        try {
            const config = this.getHook().config;
            
            const data = LayerData.getLayerData(graphic.model.get("layer"));

            ctx.save();
            ctx.globalAlpha = config.globalAlpha;
            ctx.lineWidth = config.textStrokeWidth;

            if (!config.rotateAlongWithToken) {
                ctx.rotate(-getRotation(ctx));
            }

            let sz = config.textFontSize;
            ctx.font = "bold " + sz + "px Arial";
            
            let txtWidth = ctx.measureText(data.txt).width;

            const pxOffsetFromFloor = txtWidth * 0.08;
            const pxWallPadding = txtWidth * 0.18;

            let offX = Math.floor(graphic.get<number>("width") / 2) - txtWidth;
            let offY = Math.floor(graphic.get<number>("height") / 2);

            ctx.fillStyle = data.makeBgStyle(config.backgroundOpacity);
            ctx.fillRect(offX - (pxWallPadding * 0.5), offY - sz, txtWidth + pxWallPadding , sz);

            ctx.strokeStyle = `rgba(${config.textStrokeColor[0]}, ${config.textStrokeColor[1]}, ${config.textStrokeColor[2]}, ${config.textStrokeOpacity})`;
            
            ctx.fillStyle = `rgba(${config.textFillColor[0]},${config.textFillColor[1]},${config.textFillColor[2]}, ${config.textFillOpacity})`;

            ctx.strokeText(data.txt, offX, offY - pxOffsetFromFloor);
            ctx.fillText(data.txt, offX, offY - pxOffsetFromFloor);

            ctx.restore();
        } catch (err) {
            console.error(err);
        }
    }

    onSettingChange(name, oldVal, newVal) {
        console.log("change found");
        R20.renderAll();
    }

    setup() {
        if(!R20.isGM()) return;
        
        window.r20es.tokenDrawBg = this.drawOverlay;
        R20.renderAll();
    }

    dispose() {
        window.r20es.tokenDrawBg = null;
        R20.renderAll();
    }
}

if (R20Module.canInstall()) new TokenLayerDrawing().install();

const hook = R20Module.makeHook(__filename, {
    id: "tokenLayerDrawing",
    name: "Draw Token Layer on Tokens",
    description: "Draws an indicator at the bottom left of each token that indicates which layer it is on.",
    category: R20Module.category.canvas,
    gmOnly: true,
    media: {
        "token_mp.png": "A token in the map layer",
        "token_tk.png": "A token in the player token layer",
        "token_gm.png": "A token in the GM layer"
    },

    includes: "assets/app.js",
    find: "this.model.view.updateBackdrops(e),this.active",
    patch: "this.model.view.updateBackdrops(e), window.is_gm && window.r20es && window.r20es.tokenDrawBg && window.r20es.tokenDrawBg(e, this), this.active",

    configView: {
        globalAlpha: {
            display: "Global opacity",
            type: "slider",

            sliderMin: 0,
            sliderMax: 1,
        },
        backgroundOpacity: {
            display: "Background opacity",
            type: "slider",

            sliderMin: 0,
            sliderMax: 1,
        },

        rotateAlongWithToken: {
            display: "Rotate overlay along with token",
            type: "checkbox"
        },

        textStrokeWidth: {
            display: "Text outline width",
            type: "number",

            numberMin: 0,
        },
        textStrokeOpacity: {
            display: "Text stroke opacity",
            type: "slider",

            sliderMin: 0,
            sliderMax: 1,
        },
        textStrokeColor: {
            display: "Text stroke color",
            type: "color"
        },

        textFillOpacity: {
            display: "Text fill opacity",
            type: "slider",

            sliderMin: 0,
            sliderMax: 1,
        },
        textFontSize: {
            display: "Font size",
            type: "number",

            numberMin: 0,
        },
        textFillColor: {
            display: "Text fill color",
            type: "color"
        },

    },

    config: {
        globalAlpha: 1,
        backgroundOpacity: 0.5,
        textStrokeWidth: 2,
        textStrokeOpacity: 1,
        textStrokeColor: [0, 0, 0],
        textFillOpacity: 1,
        textFillColor: [255, 255, 255],
        textFontSize: 18,
        rotateAlongWithToken: false,
    },
});

export { hook as TokenLayerDrawingHook };
