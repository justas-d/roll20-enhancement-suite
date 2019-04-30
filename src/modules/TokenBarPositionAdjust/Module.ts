import {R20Module} from "../../utils/R20Module";
import {R20} from "../../utils/R20";

class TokenBarPositionAdjust  extends R20Module.SimpleBase {
    constructor() {
        super(__dirname);
    }

    barDraw = (ctx: CanvasRenderingContext2D, graphic: Roll20.CanvasObject) => {
        try {
            if(graphic._bar_data) {
                graphic._bar_data.position[1] = graphic.height / 2 - graphic._bar_data.height;
            }

            // @ts-ignore
            graphic._drawBars(ctx);
        } catch (err) {
            console.error(err);
        }
    };

    setup() {
        if (!R20.isGM()) return;

        window.r20es["barDraw"] = this.barDraw;
        R20.renderAll();
    }

    dispose() {
        window.r20es["barDraw"] = null;
        R20.renderAll();
    }
}

if (R20Module.canInstall()) new TokenBarPositionAdjust().install();
