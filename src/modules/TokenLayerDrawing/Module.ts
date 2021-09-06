import {R20Module} from "../../utils/R20Module";
import {R20} from "../../utils/R20";
import {layerInfo} from "../../utils/LayerInfo";

const DEG_TO_RAD = Math.PI / 180.0;

class TokenLayerDrawing extends R20Module.SimpleBase {
    constructor() {
        super(__dirname);
    }

    drawOverlay = (ctx: CanvasRenderingContext2D, graphic: Roll20.CanvasObject) => {

        try {

            const config = this.getHook().config;
            const bitmap = {
                [R20.CanvasLayer.GMTokens]: config.drawOnGmLayer,
                [R20.CanvasLayer.PlayerTokens]: config.drawOnTokenLayer,
                [R20.CanvasLayer.Map]: config.drawOnMapLayer,
                [R20.CanvasLayer.Lighting]: config.drawOnLightsLayer,
                [R20.CanvasLayer.B20Weather]: config.drawOnWeatherLayer,
                [R20.CanvasLayer.B20Foreground]: config.drawOnForegroundLayer,
                [R20.CanvasLayer.B20Background]: config.drawOnBackgroundLayer,
            };

            const model = R20.try_get_canvas_object_model(graphic);
            if(!model) {
                return;
            }

            const layer: R20.CanvasLayer = model.get("layer");

            if (!bitmap[layer]) {
                return;
            }

            const layerData = layerInfo[layer];

            // Note(justas): I don't trust ctx.save() so we're doing it manually.
            ctx.save();
            const oldAlpha = ctx.globalAlpha;
            const oldLineWidth = ctx.lineWidth;
            const oldFillStyle = ctx.fillStyle;
            const oldStrokeStyle = ctx.strokeStyle;
            const oldFont = ctx.font;

            ctx.globalAlpha = config.globalAlpha;
            ctx.lineWidth = config.textStrokeWidth;

            if (!config.rotateAlongWithToken) {
                // @ts-ignore
                const isOneFlipOn = graphic.flipY ^ graphic.flipX;

                let mul = isOneFlipOn ? 1 : -1;
                ctx.rotate(mul * graphic.angle * DEG_TO_RAD);
            }

            if (graphic.flipX) {
                ctx.scale(-1, 1);
            }
            if (graphic.flipY) {
                ctx.scale(1, -1);
            }

            let sz = config.textFontSize;
            ctx.font = "bold " + sz + "px Arial";

            let txtWidth = ctx.measureText(layerData.txt).width;

            const pxOffsetFromFloor = txtWidth * 0.08;
            const pxWallPadding = txtWidth * 0.18;

            let offX = Math.floor(graphic.get<number>("width") / 2) - txtWidth;
            let offY = Math.floor(graphic.get<number>("height") / 2);

            // NOTE(justas) is TOkeBarPositionAdjust enabled?
            if(window.r20es.is_drawing_bars_at_the_bottom && graphic._bar_data) {
                offY -= graphic._bar_data.height * graphic._bar_data.to_render.length + 3;
            }

            {
                ctx.fillStyle = `rgba(${layerData.bgColors[0]}, ${layerData.bgColors[1]}, ${layerData.bgColors[2]}, ${config.backgroundOpacity})`;
                ctx.fillRect(offX - (pxWallPadding * 0.5), offY - sz, txtWidth + pxWallPadding, sz);
            }

            {

                ctx.strokeStyle = `rgba(${config.textStrokeColor[0]}, ${config.textStrokeColor[1]}, ${config.textStrokeColor[2]}, ${config.textStrokeOpacity})`;
                ctx.fillStyle = `rgba(${config.textFillColor[0]}, ${config.textFillColor[1]},${config.textFillColor[2]}, ${config.textFillOpacity})`;
                ctx.strokeText(layerData.txt, offX, offY - pxOffsetFromFloor);
                ctx.fillText(layerData.txt, offX, offY - pxOffsetFromFloor);
            }

            {
                ctx.restore();
                ctx.globalAlpha = oldAlpha;
                ctx.lineWidth = oldLineWidth;
                ctx.fillStyle = oldFillStyle;
                ctx.strokeStyle = oldStrokeStyle;
                ctx.font = oldFont;
            }

        } catch (err) {
            console.error(err);
        }
    };

    onSettingChange(name, oldVal, newVal) {
        R20.renderAll();
    }

    setup() {
        if (!R20.isGM()) return;

        window.r20es.tokenDrawBg = this.drawOverlay;
        R20.renderAll();
    }

    dispose() {
        window.r20es.tokenDrawBg = null;
        R20.renderAll();
    }
}

export default () => {
  new TokenLayerDrawing().install();
};

